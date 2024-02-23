import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { MikroORM } from '@mikro-orm/postgresql';
import ORMConfig from '../mikro-orm.config';

const microORM: FastifyPluginAsync = async function (fastify) {
  const orm = await MikroORM.init({
    ...ORMConfig,
    password: fastify.config.POSTGRES_PASSWORD,
    port: fastify.config.POSTGRES_PORT,
    user: fastify.config.POSTGRES_USER,
    host: fastify.config.POSTGRES_HOST,
    debug: true,
  });

  fastify.decorate('mikroORM', { orm });

  fastify.addHook('onRequest', async function (this: typeof fastify, request) {
    request.mikroORM = this.mikroORM;

    request.mikroORM.orm.em = request.mikroORM.orm.em.fork();
  });

  fastify.addHook('onClose', () => orm.close());
};

export default fp(microORM, {
  name: 'micro-orm',
  dependencies: ['application-config'],
});
