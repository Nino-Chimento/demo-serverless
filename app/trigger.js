const AWS = require("aws-sdk");
const dynamodb = require("./lib/dynamodb-client");

const getRandomInt = (max) => Math.floor(Math.random() * max);

exports.handler = async (event, context) => {
  process.env.requestId = context.awsRequestId;

  const s3Key = event.Records[0].s3.object.key;
  const s3Time = event.Records[0].eventTime;
  console.log(event.Records[0]);
  const s3 = new AWS.S3({ apiVersion: "2012-08-10" });
  const paramsS3 = { Bucket: "demo-users-nino", Key: s3Key };
  const response = await s3.getObject(paramsS3).promise(); // await the promise
  const fileContent = response.Body.toString("utf-8");
  const fileParse = JSON.parse(fileContent);
  const client = dynamodb.getClient();
  const user = {
    userId: getRandomInt(10000).toString(),
    customerId: getRandomInt(10000).toString(),
    creationDate: s3Time,
    migrated: true,
    file: fileParse,
  };
  const params = {
    TableName: process.env.DYNAMODB_USERS_TABLE,
    Item: user,
  };
  try {
    const response = await client.put(params).promise();
    return response;
  } catch (error) {
    console.error(error.message);
    throw new Error(error.message);
  }
};
