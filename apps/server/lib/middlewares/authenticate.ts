import { FastifyReply, FastifyRequest } from "fastify";

const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		await request.jwtVerify();
	} catch (err) {
		request.log.error(err);
		return reply.code(401).send({ error: "Unauthorized! Please send a request to /auth" });
	}
};

export default authenticate;
