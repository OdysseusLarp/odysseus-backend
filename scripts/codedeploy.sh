#!/bin/bash

BUCKET="odysseus-larp-dev"
REGION="eu-west-1"
PACKAGE_NAME="backend_${CIRCLE_BUILD_NUM}.tar.gz"

echo "Creating package ${PACKAGE_NAME}"
tar czf ${PACKAGE_NAME} src db fixtures scripts node_modules \
	package.json package-lock.json knexfile.js aws appspec.yml

echo "Saving ${PACKAGE_NAME} to S3"
aws s3 cp ${PACKAGE_NAME} s3://${BUCKET}/${PACKAGE_NAME} --region $REGION

echo "Deploying using CodeDeploy"
DEPLOYMENT=`aws deploy create-deployment \
	--application-name odysseus-backend \
	--deployment-group odysseus-backend-dev \
	--s3-location bucket=${BUCKET},bundleType=tgz,key=${PACKAGE_NAME} \
	--region ${REGION} \
	--query deploymentId \
	--output text`

echo "Waiting for deployment to finish"
aws deploy wait deployment-successful --deployment-id ${DEPLOYMENT} --region ${REGION}

echo "Deployment finished"
exit 0
