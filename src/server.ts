import { Handler, Context } from "aws-lambda";
import axios from "axios";

interface Response {
    header: Object;
    statusCode: Number;
    body: String;
}

interface Leaguer {
    id: Number;
    name: String;
    photo: String;
    teamName: String;
    mainHeroes?: Array<String>;
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

const getAllLeaguers = async (event: any) => {
    try {
        const url = `${process.env.END_POINT}/players?locale=ko-kr`;
        const request = await axios.get(url);

        const leaguers: Array<Object> = request.data.content.map(
            (item: any, index: Number) => {
                const leaguer: Leaguer = {
                    id: Number(item.id),
                    name: item.name,
                    photo: item.headshot,
                    teamName: item.teams[0].team.name,
                    mainHeroes: item.attributes.heroes,
                };

                return leaguer;
            }
        );

        const response: Response = createResponse(200, { leaguers });
        return response;
    } catch (err) {
        console.log(err);

        const errObj = { message: err.message };

        const response: Response = createResponse(500, errObj);
        return response;
    }
};

export { hello, getAllLeaguers };
