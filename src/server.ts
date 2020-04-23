import { Handler, Context } from "aws-lambda";

interface Response {
  header: Object;
  statusCode: Number;
  body: String;
}

const createResponse = (statusCode: Number, body: Object) => {
  return {
    header: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    statusCode,
    body: JSON.stringify(body),
  };
};

const hello: Handler = async (event: any, context: Context) => {
  const response: Response = createResponse(200, { message: "hello" });
  return response;
};

export { hello };
