export const postData = async (url = "", data = {}, otherHeaders = {}) => {
    // Default options are marked with *
    const response = await fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "include", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
            ...otherHeaders,
        },
        redirect: "follow", // manual, *follow, error
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    });

    return response.json(); // parses JSON response into native JavaScript objects
}

export const getData = async (url = "", otherHeaders = {}) => {
    // Default options are marked with *
    const response = await fetch(url, {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        credentials: "include", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
            ...otherHeaders,
        },
        redirect: "follow", // manual, *follow, error
    });

    return response.json(); // parses JSON response into native JavaScript objects
}