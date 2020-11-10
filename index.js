exports.getServerLocation = function (environment) {
    this.environment = environment;
    if (environment == 'sit') {
        return 'http://api-sit.doku.com';
    } else if (environment == 'sandbox') {
        return 'https://sandbox.doku.com';
    } else if (environment == 'production') {
        return 'https://api.doku.com';
    } else {
        return environment;
    }
}

exports.getCheckSum = function (setupConfiguration, paymentCodeRequest) {
    const CryptoJS = require("crypto-js");

    let wordsComponent =
        setupConfiguration.client_id
        + paymentCodeRequest.customer.email
        + paymentCodeRequest.customer.name
        + paymentCodeRequest.order.amount
        + paymentCodeRequest.order.invoice_number
        + paymentCodeRequest.virtual_account_info.expired_time
        + paymentCodeRequest.virtual_account_info.info1
        + paymentCodeRequest.virtual_account_info.info2
        + paymentCodeRequest.virtual_account_info.info3
        + paymentCodeRequest.virtual_account_info.reusable_status
        + setupConfiguration.shared_key;

    return CryptoJS.enc.Hex.stringify(CryptoJS.SHA256(wordsComponent));
}

exports.SetupConfiguration = {
    client_id: "",
    merchant_name: "",
    shared_key: "",
    environment: "",
    serverLocation: "",
    channel: "",
    request_id: "",
    request_timestamp: "",
    api_target: ""
};

exports.PaymentCodeRequestDto = {
    order: {
        invoice_number: "",
        amount: 0
    },
    virtual_account_info: {
        expired_time: 0,
        reusable_status: true,
        info1: "",
        info2: "",
        info3: ""
    },
    customer: {
        name: "",
        email: ""
    },
    additional_info: {
    }
}

exports.generateMandiriVa = async function generateMandiriVa(setupConfiguration, paymentCodeRequest) {
    setupConfiguration.api_target = '/mandiri-virtual-account/v2/payment-code';
    return await post(setupConfiguration, paymentCodeRequest);
}

exports.generateDOKUVa = async function generateDOKUVa(setupConfiguration, paymentCodeRequest) {
    setupConfiguration.api_target = '/doku-virtual-account/v2/payment-code';
    return await post(setupConfiguration, paymentCodeRequest);
}

function post(setupConfiguration, paymentCodeRequest) {
    const axios = require('axios')

    setupConfiguration.request_id = Math.floor(Math.random() * Math.floor(100000));
    setupConfiguration.request_timestamp = new Date().toISOString().slice(0, 19) + "Z";

    //delete in v2
    var hmac;
    if (setupConfiguration.api_target.includes('mandiri')) {
        hmac = "HMACHSHA256=";
        delete paymentCodeRequest['additional_info'];
    } else {
        hmac = "HMACSHA256=";
        var integrationInfo = {
            integration: {
                name: "nodejs-library",
                version: "2.0.0"
            }
        };

        Object.assign(paymentCodeRequest.additional_info, integrationInfo);
    }

    let axiosConfig = {
        headers: {
            'Signature': hmac + createSignature(setupConfiguration, paymentCodeRequest),
            'Request-Id': setupConfiguration.request_id,
            'Client-Id': setupConfiguration.client_id,
            'Request-Timestamp': setupConfiguration.request_timestamp,
            'Request-Target': setupConfiguration.api_target
        }
    };

    return axios.post(setupConfiguration.serverLocation + setupConfiguration.api_target, paymentCodeRequest, axiosConfig)
        .then(res => {
            return res.data;
        })
        .catch(error => {
            throw error;
        })
}

exports.getNotification = function getNotification(request) {
    let response = {
        order: {
            invoice_number: request['order']['invoice_number'],
            amount: request['order']['amount']
        },
        virtual_account_info: {
            virtual_account_number: request['virtual_account_info']['virtual_account_number']
        }
    }
    return response;
}

exports.getSignature = function getSignature(header, notifyRequest, key) {
    const CryptoJS = require("crypto-js");
    return new Promise((resolve, reject) => {
        try {
            var bodySha256 = CryptoJS.enc.Base64.stringify(CryptoJS.SHA256(notifyRequest));
            var signatureComponents =
                "Client-Id:" + header['client-id'] + "\n"
                + "Request-Id:" + header['request-id'] + "\n"
                + "Request-Timestamp:" + header['request-timestamp'] + "\n"
                + "Request-Target:" + header['request-target'] + "\n"
                + "Digest:" + bodySha256;
            var signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(signatureComponents, key));
            return resolve('HMACSHA256=' + signature);
        } catch (error) {
            return reject(error);
        }
    });
}

function createSignature(setupConfiguration, incomingRequest) {
    const CryptoJS = require("crypto-js");
    var channel = setupConfiguration.channel;

    if (channel == 'mandiri') {
        apiTarget = '/mandiri-virtual-account/v2/payment-code';
    } else if (channel == 'doku') {
        apiTarget = '/doku-virtual-account/v2/payment-code';
    } else if (channel == 'mandiri-syariah') {
        apiTarget = '/bsm-virtual-account/v2/payment-code';
    } else {
        apiTarget = ''
    }

    var bodySha256 = CryptoJS.enc.Base64.stringify(CryptoJS.SHA256(JSON.stringify(incomingRequest)));
    var signatureComponents =
        "Client-Id:" + setupConfiguration.client_id + "\n"
        + "Request-Id:" + setupConfiguration.request_id + "\n"
        + "Request-Timestamp:" + setupConfiguration.request_timestamp + "\n"
        + "Request-Target:" + setupConfiguration.api_target + "\n"
        + "Digest:" + bodySha256;
    var signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(signatureComponents, setupConfiguration.shared_key));

    return signature;
}