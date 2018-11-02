require('dotenv').config({ silent: true });
import expressSwagger from 'express-swagger-generator';

const options = {
	swaggerDefinition: {
		info: {
			description: 'Backend for systems used in Odysseus LARP',
			title: 'Odysseus Backend',
			version: '0.0.0'
		},
		host: `localhost:${process.env.APP_PORT}`,
		basePath: '/',
		produces: [
			'application/json'
		],
		schemes: ['http'],
		securityDefinitions: {}
	},
	basedir: __dirname,
	files: ['./routes/**/*.js', './models/**/*.js']
};

export function loadSwagger(app) {
	return expressSwagger(app)(options);
}
