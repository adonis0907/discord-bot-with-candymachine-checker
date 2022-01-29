import got from 'got';

async function getSite (url) {
    let candyID;
    const response = await got(url);

    let scripts = await getAllLinks(response.body);
    for (let i = 0; i < scripts.length; i++) {
        candyID = await getCandyID(`${url}${scripts[i]}`);
        if (typeof(candyID) === "string") {
            break;
        }
    }
    return candyID === undefined ? "Cannot find a CMID!" : candyID;
}

async function getCandyID (url) {
    const response = await got(url);

    let candyID = response.body.match(/(?<=REACT_APP_CANDY_MACHINE_ID:("| "))(.*?)(?=")/g);
    if(candyID != null || undefined) {
        return candyID[0];
    }
}

async function getAllLinks (body) {
    return body.match(/(?<=script src=")(.*?)(?=")/g);
}

export default getSite;