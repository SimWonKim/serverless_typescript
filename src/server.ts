import { Handler, Context } from "aws-lambda";
import axios, { AxiosResponse } from "axios";
import * as _ from "lodash";

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

interface Team {
    id: Number;
    name: String;
    logo: String;
}

interface leaguerDetail {
    leaguer: Leaguer;
    team: Team;
    familyName: String;
    givenName: String;
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

const getAllLeaguers: Handler = async (event: any) => {
    try {
        const size: number = Number(event.queryStringParameters.size);
        const page: number = Number(event.queryStringParameters.page);

        const start: number = Number(page - 1) * size;

        const url: string = `${process.env.END_POINT}/players?locale=ko-kr`;
        const request: AxiosResponse = await axios.get(url);

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

        const sortLeaguers = _.sortBy(leaguers, "name");

        const response: Response = createResponse(200, {
            leaguers: sortLeaguers.slice(start, start + size),
            counts: sortLeaguers.length,
        });

        return response;
    } catch (err) {
        console.log(err);

        const errObj = { message: err.message };

        const response: Response = createResponse(500, errObj);
        return response;
    }
};

const getLeaguerById: Handler = async (event: any) => {
    try {
        const id: number = event.pathParameters.id;

        const url: string = `${process.env.END_POINT}/players/${id}?locale=ko-kr`;
        const request: AxiosResponse = await axios.get(url);
        const leaguerDetailResponse: any = request.data.data.player;

        // console.log(leaguerDetailResponse);

        const leaguer: Leaguer = {
            id: Number(leaguerDetailResponse.id),
            name: leaguerDetailResponse.name,
            photo: leaguerDetailResponse.headshot,
            teamName: leaguerDetailResponse.teams[0].team.name,
            mainHeroes: leaguerDetailResponse.attributes.heroes,
        };

        const team: Team = {
            id: Number(leaguerDetailResponse.teams[0].team.id),
            name: leaguerDetailResponse.teams[0].team.name,
            logo: leaguerDetailResponse.teams[0].team.logo,
        };

        const leaguerDetail: leaguerDetail = {
            leaguer: leaguer,
            team: team,
            familyName: leaguerDetailResponse.familyName,
            givenName: leaguerDetailResponse.givenName,
        };

        const response: Response = createResponse(200, {
            leaguer: leaguerDetail,
        });

        return response;
    } catch (err) {
        console.log(err);

        const errObj = { message: err.message };

        const response: Response = createResponse(500, errObj);
        return response;
    }
};

export { hello, getAllLeaguers, getLeaguerById };
