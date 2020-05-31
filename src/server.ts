import { Handler } from 'aws-lambda';
import axios, { AxiosResponse } from 'axios';
import * as _ from 'lodash';

interface Response {
    headers: {
        'Access-Control-Allow-Origin': string;
        'Access-Control-Allow-Credentials': boolean;
    };
    statusCode: number;
    body: string;
    isBase64Encoded: boolean;
}

interface Leaguer {
    id: number;
    name: string;
    photo: string;
    teamName: string;
    mainHeroes?: Array<string>;
}

interface Team {
    id: number;
    name: string;
    logo: string;
}

interface leaguerDetail {
    leaguer: Leaguer;
    team: Team;
    familyName: string;
    givenName: string;
}

const createResponse = (statusCode: number, body: string) => {
    const response: Response = {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        statusCode,
        body,
        isBase64Encoded: false,
    };

    return response;
};

// const hello: Handler = async (event: any, context: Context) => {
//     const response: Response = createResponse(200, { message: 'hello' });
//     return response;
// };

const getAllLeaguers: Handler = async (event: any) => {
    try {
        const size = Number(event.queryStringParameters.size);
        const page = Number(event.queryStringParameters.page);

        const start: number = Number(page - 1) * size;

        const url = `${process.env.END_POINT}/players?locale=ko-kr`;
        const request: AxiosResponse = await axios.get(url);

        // eslint-disable-next-line @typescript-eslint/ban-types
        const leaguers: Array<Object> = request.data.content.map((item: any, index: number) => {
            const leaguer: Leaguer = {
                id: Number(item.id),
                name: item.name,
                photo: item.headshot,
                teamName: item.teams[0].team.name,
                mainHeroes: item.attributes.heroes,
            };

            return leaguer;
        });

        const sortLeaguers = _.sortBy(leaguers, 'name');

        const response: Response = createResponse(
            200,
            JSON.stringify({
                leaguers: sortLeaguers.slice(start, start + size),
                counts: sortLeaguers.length,
            }),
        );

        return response;
    } catch (err) {
        console.log(err);

        const errObj = { message: err.message };

        const response: Response = createResponse(500, JSON.stringify(errObj));
        return response;
    }
};

const getLeaguerById: Handler = async (event: any) => {
    try {
        const id: number = event.pathParameters.id;

        const expandDatas: Array<string> = ['stats', 'stat.ranks'];

        const url = `${process.env.END_POINT}/players/${id}?locale=ko-kr&expand=${expandDatas.join(',')}`;
        const request: AxiosResponse = await axios.get(url);
        const leaguerDetailResponse: any = request.data.data.player;

        console.log(leaguerDetailResponse);

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

        const response: Response = createResponse(
            200,
            JSON.stringify({
                leaguer: leaguerDetail,
            }),
        );

        return response;
    } catch (err) {
        console.log(err);

        const errObj = { message: err.message };

        const response: Response = createResponse(500, JSON.stringify(errObj));
        return response;
    }
};

export { getAllLeaguers, getLeaguerById };
