var AWS = require("aws-sdk");
var dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = function (event, context, callback) {
  event.payload.TableName = "customers";
  var response;

  var params = {
    TableName: "customers",
    FilterExpression: "#p = :phone",
    ExpressionAttributeNames: {
      "#p": "phoneNumber",
    },
    ExpressionAttributeValues: {
      ":phone": `${event.payload.Item.phoneNumber}`,
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
        if (
          data.Items[0].type == "lead" &&
          event.payload.Item.type == "client"
        ) {
          let time = Date.now();
          let updateParams = {
            TableName: "customers",
            Key: {
              id: `${data.Items[0].id}`,
            },
            UpdateExpression:
              "SET #t = :type, #ut = :updatedAt, #ct = :clientAt",
            ExpressionAttributeNames: {
              "#t": "type",
              "#ut": "updatedAt",
              "#ct": "clientAt",
            },
            ExpressionAttributeValues: {
              ":type": "client",
              ":updatedAt": `${time}`,
              ":clientAt": `${time}`,
            },
          };
          dynamo.update(updateParams, function (err, data) {
            if (err) {
              console.log(err, err.stack); // an error occurred
              response = {
                statusCode: 400,
                body: "Error during database operation!",
              };
              callback(null, response);
            } else {
              console.log("Customer is now a client!");
              response = {
                statusCode: 202,
                body: "Customer is now a client!",
              };
              callback(null, response);
            }
          });
        } else {
          console.log("Customer already exists!");
          response = {
            statusCode: 409,
            body: "Customer already exists!",
          };
          callback(null, response);
        }
      } else {
        event.payload.Item.id = context.awsRequestId;
        let time = Date.now();
        event.payload.Item.updatedAt = `${time}`;
        event.payload.Item.createdAt = `${time}`;
        if (event.payload.Item.type == "lead") {
          event.payload.Item.leadAt = `${time}`;
        } else if (event.payload.Item.type == "client") {
          event.payload.Item.clientAt = `${time}`;
        }
        dynamo.put(event.payload, function (err, data) {
          if (err) {
            console.log(err, err.stack); // an error occurred
            response = {
              statusCode: 400,
              body: "Error during database operation!",
            };
            callback(null, response);
          } else {
            console.log("\nCustomer created!");
            response = {
              statusCode: 201,
              body: "Customer created!",
            };
            callback(null, response);
          }
        });
      }
    }
  });
};
