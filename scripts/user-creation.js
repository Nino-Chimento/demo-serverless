const { DynamoDB } = require('aws-sdk');
const braintree = require('braintree');
const { faker } = require('@faker-js/faker');

const getDynamoClient = () => {
  return new DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: 'eu-west-1',
  });
};

const getBraintreeClient = () => {
  return new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: '5znrwzrrbgs4g279',
    publicKey: 'b87rktsd5qbpgnr7',
    privateKey: '555df8e27dfe334bca7f2613dc16834a',
  });
};

const getUsersFromDynamo = async (client) => {
  const params = {
    TableName: 'Pdp-Users-stage',
    FilterExpression: 'migrated = :status',
    ExpressionAttributeValues: { ':status': false },
  };
  const data = await client.scan(params).promise();
  return data.Items;
};

const createCustomer = async (client, user) => {
  return new Promise((resolve, reject) => {
    client.customer
      .create(user)
      .then((result) => resolve(result))
      .catch((err) => reject(err));
  });
};

const getFakeUser = (customerId) => {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  return {
    id: customerId,
    firstName: firstName,
    lastName: lastName,
    email: faker.internet.email(firstName, lastName),
  };
};

const wait = async (delay) => {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
};

const run = async () => {
  const dynamoClient = getDynamoClient();
  const braintreeClient = getBraintreeClient();
  faker.setLocale('it');
  const users = await getUsersFromDynamo(dynamoClient);
  console.info(`Loaded ${users.length} users from Dynamo`);
  let created = 0;
  let failed = 0;
  let errors = [];
  for (let i = 0; i < users.length; i++) {
    try {
      if (!users[i].customerId) {
        throw new Error('Missing required value customerId');
      }
      const user = getFakeUser(users[i].customerId);
      const result = await createCustomer(braintreeClient, user);
      if (result.success) {
        created++;
        console.info(`Successfully created user with customer ID ${users[i].customerId}`);
      } else {
        throw new Error(result.message);
      }
      await wait(1000);
    } catch (err) {
      failed++;
      console.error(`Error while processing user with customer ID ${users[i].customerId}: ${err}`);
      errors.push({
        customerId: `${users[i].customerId}`,
        message: JSON.stringify(err.message),
      });
    }
  }
  console.info(`Execution finished: created: ${created} - failed ${failed}`);
  console.info('ERRORS', errors);
};

run();
