import { Express } from "express";
import expressSwagger from 'express-swagger-generator';

const options = {
	swaggerDefinition: {
		info: {
			description: 'Backend for systems used in Odysseus LARP',
			title: 'Odysseus Backend',
			version: '0.0.0'
		},
		basePath: '/',
		produces: [
			'application/json'
		],
		schemes: [process.env.USE_HTTPS ? 'https' : 'http'],
		securityDefinitions: {}
	},
	basedir: __dirname,
	files: ['./routes/**/*.{js,ts}', './models/**/*.{js,ts}', './index.ts', './messaging.ts', './emptyepsilon.js']
};

export function loadSwagger(app: Express) {
	expressSwagger(app)(options);
}
