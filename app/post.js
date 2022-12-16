const dynamodb = require("./lib/dynamodb-client");

exports.handler = async (event, context) => {
  process.env.requestId = context.awsRequestId;
  const body = JSON.parse(event.body);

  const user = {
    userId: body.userId,
    customerId: body.customerId,
    creationDate: Date.now(),
    migrated: true,
  };
  const client = dynamodb.getClient();
  const params = {
    TableName: process.env.DYNAMODB_USERS_TABLE,
    Item: user,
  };
  try {
    await client.put(params).promise();
    const response = {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      isBase64Encoded: false,
      multiValueHeaders: {
        "X-Custom-Header": [""],
      },
      body: JSON.stringify(user),
    };
    return response;
  } catch (error) {
    console.error(error.message);
    throw new Error(error.message);
  }
};
