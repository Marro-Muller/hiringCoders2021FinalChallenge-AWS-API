var AWS = require("aws-sdk");
var dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = function (event, context, callback) {
  event.payload.TableName = "customers";
  var response;
  var params = {
    TableName: "customers",
    FilterExpression: "#e = :email",
    ExpressionAttributeNames: {
      "#e": "email",
    },
    ExpressionAttributeValues: {
      ":email": `${event.payload.Item.email}`,
    },
  };
  dynamo.scan(params, function (err, data) {
    if (err) {
      console.log(err, err.stack); // an error occurred
      response = {
        statusCode: 400,
        body: "Error during database operation!",
      };
      callback(null, response);
    } else {
      if (data.Count > 0) {
        let paramsCounter = 0;
        let updateParams = {
          TableName: "customers",
          Key: {
            id: `${data.Items[0].id}`,
          },
        };

        if (event.payload.Item.name) paramsCounter += 1;
        if (event.payload.Item.phoneNumber) paramsCounter += 2;

        let time = Date.now();

        switch (paramsCounter) {
          case 1:
            updateParams.UpdateExpression = "SET #n = :name, #ut = :updatedAt";
            updateParams.ExpressionAttributeNames = {
              "#n": "name",
              "#ut": "updatedAt",
            };
            updateParams.ExpressionAttributeValues = {
              ":name": `${event.payload.Item.name}`,
              ":updatedAt": `${time}`,
            };
            break;
          case 2:
            updateParams.UpdateExpression = "SET #p = :phone, #ut = :updatedAt";
            updateParams.ExpressionAttributeNames = {
              "#p": "phoneNumber",
              "#ut": "updatedAt",
            };
            updateParams.ExpressionAttributeValues = {
              ":phone": `${event.payload.Item.phoneNumber}`,
              ":updatedAt": `${time}`,
            };
            break;
          case 3:
            updateParams.UpdateExpression =
              "SET #n = :name, #p = :phone, #ut = :updatedAt";
            updateParams.ExpressionAttributeNames = {
              "#n": "name",
              "#p": "phoneNumber",
              "#ut": "updatedAt",
            };
            updateParams.ExpressionAttributeValues = {
              ":name": `${event.payload.Item.name}`,
              ":phone": `${event.payload.Item.phoneNumber}`,
              ":updatedAt": `${time}`,
            };
            break;
          default:
            response = {
              statusCode: 400,
              body: "No change asked!",
            };
            callback(null, response);
            return;
        }

        dynamo.update(updateParams, function (err, data) {
          if (err) {
            console.log(err, err.stack); // an error occurred
            response = {
              statusCode: 400,
              body: "Error during database operation!",
            };
            callback(null, response);
          } else {
            console.log("Customer updated!");
            response = {
              statusCode: 202,
              body: "Customer updated!",
            };
            callback(null, response);
          }
        });
      } else {
        response = {
          statusCode: 404,
          body: "Customer not found!",
        };
        callback(null, response);
      }
    }
  });
};
