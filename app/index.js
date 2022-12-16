const dynamodb = require("./lib/dynamodb-client");

exports.handler = async (event, context) => {
  process.env.requestId = context.awsRequestId;
  const userId = event.pathParameters.userId;
  if (!userId) return "User id is must";
  const client = dynamodb.getClient();
  const params = {
    TableName: process.env.DYNAMODB_USERS_TABLE,
    Key: {
      userId: userId,
    },
  };
  try {
    const data = await client.get(params).promise();
    if (!data.Item) {
      throw new Error("User not found");
    }
    const response = {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      isBase64Encoded: false,
      multiValueHeaders: {
        "X-Custom-Header": [""],
      },
      body: JSON.stringify(data.Item),
    };
    return response;
  } catch (error) {
    console.error(error.message);
    throw new Error(error.message);
  }
};
