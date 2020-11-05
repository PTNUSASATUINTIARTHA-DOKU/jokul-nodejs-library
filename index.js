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
    }
}

exports.NotifyRequestDto = {
    client: {
        id: ""
    },
    order: {
        invoice_number: "",
        amount: 0
    },
    virtual_account_info: {
        virtual_account_number: ""
    },
    virtual_account_payment: {
        date: "",
        systrace_number: "",
        reference_number: "",
        channel_code: ""
    },
    security: {
        check_sum: ""
    }
}

exports.NotifyResponseDto = {
    client: {
        id: ""
    },
    order: {
        invoice_number: "",
        amount: 0
    },
    virtual_account_info: {
        virtual_account_number: ""
    },
    security: {
        check_sum: ""
    }
}

exports.generateMandiriVa = function generateMandiriVa(paymentCodeRequest) {
    setupConfiguration.api_target = '/mandiri-virtual-account/v1/payment-code';
    return post(setupConfiguration, paymentCodeRequest);
}

exports.generateDOKUVa = function generateDOKUVa(setupConfiguration, paymentCodeRequest) {
    setupConfiguration.api_target = '/doku-virtual-account/v2/payment-code';
    return post(setupConfiguration, paymentCodeRequest);
}

function post(setupConfiguration, paymentCodeRequest) {
    const request = require('then-request');

    setupConfiguration.request_id = Math.floor(Math.random() * Math.floor(100000));
    setupConfiguration.request_timestamp = new Date().toISOString().slice(0, 19) + "Z";

    let res = request('POST', setupConfiguration.serverLocation + setupConfiguration.api_target, {
        headers: {
            'Signature': "HMACSHA256=" + createSignature(setupConfiguration, paymentCodeRequest),
            'Request-Id': setupConfiguration.request_id,
            'Client-Id': setupConfiguration.client_id,
            'Request-Timestamp': setupConfiguration.request_timestamp,
            'Request-Target': setupConfiguration.api_target,
        },
        json: paymentCodeRequest,
    });

    return JSON.parse(res.getBody('utf8'));
}

function createSignature(setupConfiguration, paymentCodeRequest) {
    const CryptoJS = require("crypto-js");
    var channel = setupConfiguration.channel;

    if (channel == 'mandiri') {
        apiTarget = '/mandiri-virtual-account/v2/payment-code';
    } else if (channel == 'doku') {
        apiTarget = '/doku-virtual-account/v2/payment-code';
    } else if (channel == 'mandiri-syariah') {
        apiTarget = '/bsm-virtual-account/v2/payment-code';
    }

    var bodySha256 = CryptoJS.enc.Base64.stringify(CryptoJS.SHA256(JSON.stringify(paymentCodeRequest)));
    var signatureComponents =
        "Client-Id:" + setupConfiguration.client_id + "\n"
        + "Request-Id:" + setupConfiguration.request_id + "\n"
        + "Request-Timestamp:" + setupConfiguration.request_timestamp + "\n"
        + "Request-Target:" + setupConfiguration.api_target + "\n"
        + "Digest:" + bodySha256;
    var signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(signatureComponents, setupConfiguration.shared_key));

    return signature;
}