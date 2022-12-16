const AWS = require("aws-sdk");

exports.handler = async (event, context) => {
  process.env.requestId = context.awsRequestId;

  const s3Key = event.Records[0].s3.object.key;
  const s3Time = event.Records[0].eventTime;
  const s3 = new AWS.S3({ apiVersion: "2012-08-10" });
  const paramsS3 = { Bucket: "demo-users-nino", Key: s3Key };
  const response = await s3.getObject(paramsS3).promise(); // await the promise
  const fileContent = response.Body.toString("utf-8");
  const fileParse = JSON.parse(fileContent);
  const ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
  const params = {
    TableName: process.env.DYNAMODB_FILES_TABLE,
    Item: {
      id: { S: s3Key },
      file: { S: fileParse },
      timestamp: { S: s3Time },
    },
  };
  try {
    const response = await ddb.putItem(params).promise();
    return response;
  } catch (error) {
    console.error(error.message);
    throw new Error(error.message);
  }
};
