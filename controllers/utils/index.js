export let fetchIPAddress = req => {
    return req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     (req.connection.socket ? req.connection.socket.remoteAddress : null);
}

export let countNumberOfDownloadsPerIP = (ipAddress, requestsPerIpMap) => {   
    if(requestsPerIpMap.get(ipAddress) === undefined){
        requestsPerIpMap.set(ipAddress, 0)
    } else {
        let prevReqsRecordedForIp = requestsPerIpMap.get(ipAddress);
        requestsPerIpMap.set(ipAddress, ++prevReqsRecordedForIp);
    }
    return requestsPerIpMap.get(ipAddress);
}