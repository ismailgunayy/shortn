import {
	AccessTokenNotFound,
	ExpiredToken,
	InvalidCookieSignature,
	InvalidToken,
	InvalidTokenType,
	UserAlreadyExists,
	UserNotFound,
	WrongPassword
} from "./auth.error";
import { App, JWTPayload } from "~/types/fastify";
import { compare, hash } from "bcrypt";

import { AuthRepository } from "~/modules/auth/auth.repository";
import { FastifyRequest } from "fastify";
import { ShortnUsers } from "~/types/db";
import crypto from "crypto";
import dayjs from "dayjs";

const SALT_ROUNDS = 12;

export enum TokenType {
	ACCESS = "shortn_access_token",
	REFRESH = "shortn_refresh_token"
}

export type AuthMethod = "accessToken" | "apiKey";

export class AuthService {
	constructor(
		private readonly app: App,
		private readonly authRepository: AuthRepository
	) {}

	public async register(values: Pick<ShortnUsers, "fullName" | "email" | "password">) {
		let { fullName, email, password } = values;

		fullName = fullName.trim();
		email = email.trim().toLowerCase();
		password = password.trim();

		const userFound = await this.authRepository.findUserByEmail(email);
		if (userFound) {
			throw new UserAlreadyExists();
		}

		const user = await this.authRepository.insertUser({
			fullName,
			email,
			password: await hash(password, SALT_ROUNDS)
		});

		return {
			id: user.id,
			fullName: user.fullName,
			email: user.email
		};
	}

	public async login(values: { email: string; password: string }) {
		let { email, password } = values;

		email = email.trim().toLowerCase();
		password = password.trim();

		const user = await this.authRepository.findUserByEmail(email);
		if (!user) {
			throw new UserNotFound();
		}

		const isPasswordMatched = await compare(password, user.password);
		if (!isPasswordMatched) {
			throw new WrongPassword();
		}

		const sessionId = crypto.randomUUID();

		const accessToken = this.generateToken({
			sessionId: sessionId,
			userId: user.id,
			tokenType: TokenType.ACCESS
		});

		const refreshToken = this.generateToken({
			sessionId: sessionId,
			userId: user.id,
			tokenType: TokenType.REFRESH
		});

		const expiresAt = dayjs().add(this.app.config.AUTH.JWT.REFRESH_EXPIRES_IN_SECONDS, "second").toDate();

		await this.authRepository.insertSession({
			id: sessionId,
			userId: user.id,
			refreshTokenHash: crypto.createHash("sha256").update(refreshToken).digest("hex"),
			expiresAt: expiresAt
		});

		return {
			user: {
				id: user.id,
				fullName: user.fullName,
				email: user.email
			},
			accessToken,
			refreshToken
		};
	}

	public async logout(sessionId: string) {
		await this.authRepository.deleteSession(sessionId);
	}

	public async me(id: number) {
		const user = await this.authRepository.findUser(id);

		if (!user) {
			throw new UserNotFound();
		}

		return {
			id: user.id,
			fullName: user.fullName,
			email: user.email,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt
		};
	}

	public async updateUser(id: number, values: Pick<Partial<ShortnUsers>, "fullName">) {
		const user = await this.authRepository.findUser(id);

		if (!user) {
			throw new UserNotFound();
		}

		const updateData: typeof values = {};

		for (const key of Object.keys(values) as (keyof typeof values)[]) {
			if (values[key] !== user[key]) {
				updateData[key] = values[key];
			}
		}

		if (Object.keys(updateData).length === 0)
			return {
				id: user.id,
				email: user.email,
				fullName: user.fullName
			};

		await this.authRepository.updateUser(id, values);

		const updatedUser = await this.authRepository.findUser(id);
		if (!updatedUser) {
			throw new UserNotFound();
		}

		return {
			id: updatedUser.id,
			email: updatedUser.email,
			fullName: updatedUser.fullName
		};
	}

	public async changePassword(
		id: number,
		currentPassword: ShortnUsers["password"],
		newPassword: ShortnUsers["password"]
	) {
		const user = await this.authRepository.findUser(id);

		if (!user) {
			throw new UserNotFound();
		}

		if (currentPassword === newPassword) {
			return {
				id: user.id,
				fullName: user.fullName,
				email: user.email
			};
		}

		const isCurrentPasswordMatched = await compare(currentPassword, user.password);
		if (!isCurrentPasswordMatched) {
			throw new WrongPassword();
		}

		const hashedPassword = await hash(newPassword, SALT_ROUNDS);

		await this.authRepository.updateUser(id, { password: hashedPassword });

		const updatedUser = await this.authRepository.findUser(id);
		if (!updatedUser) {
			throw new UserNotFound();
		}

		return {
			id: updatedUser.id,
			fullName: updatedUser.fullName,
			email: updatedUser.email
		};
	}

	public async deleteUser(id: number) {
		const user = await this.authRepository.findUser(id);

		if (!user) {
			throw new UserNotFound();
		}

		await this.authRepository.deleteUser(id);
	}

	private generateToken(payload: JWTPayload) {
		const expiresIn =
			payload.tokenType === TokenType.ACCESS
				? this.app.config.AUTH.JWT.ACCESS_EXPIRES_IN_SECONDS
				: this.app.config.AUTH.JWT.REFRESH_EXPIRES_IN_SECONDS;

		return this.app.jwt.sign(payload, { expiresIn });
	}

	public authenticateAccessToken(request: FastifyRequest) {
		let payload;

		if (request.cookies[TokenType.ACCESS]) {
			const { value: accessToken, valid } = request.unsignCookie(request.cookies[TokenType.ACCESS]);

			if (!valid) {
				throw new InvalidCookieSignature();
			}

			try {
				payload = this.app.jwt.verify(accessToken);

				if (payload.tokenType !== TokenType.ACCESS) {
					throw new InvalidTokenType();
				}
			} catch (err) {
				throw new InvalidToken(err);
			}
		} else {
			throw new AccessTokenNotFound();
		}

		return payload;
	}

	public async authenticateRefreshToken(token: string) {
		let payload;

		try {
			payload = this.app.jwt.verify(token);

			if (payload.tokenType !== TokenType.REFRESH) {
				throw new InvalidTokenType("Expected refresh token");
			}
		} catch (err) {
			throw new InvalidToken(err);
		}

		const session = await this.authRepository.findSession(payload.sessionId);

		if (!session) {
			throw new ExpiredToken();
		}

		const incomingHash = crypto.createHash("sha256").update(token).digest("hex");

		if (incomingHash !== session.refreshTokenHash) {
			await this.authRepository.deleteSession(session.id);
			throw new InvalidToken();
		}

		const newAccessToken = this.generateToken({
			sessionId: session.id,
			userId: session.userId,
			tokenType: TokenType.ACCESS
		});

		const newRefreshToken = this.generateToken({
			sessionId: session.id,
			userId: session.userId,
			tokenType: TokenType.REFRESH
		});

		const expiresAt = dayjs().add(this.app.config.AUTH.JWT.REFRESH_EXPIRES_IN_SECONDS, "second").toDate();

		await this.authRepository.updateSession(session.id, {
			expiresAt: expiresAt,
			refreshTokenHash: crypto.createHash("sha256").update(newRefreshToken).digest("hex")
		});

		return { newAccessToken, newRefreshToken };
	}
}
