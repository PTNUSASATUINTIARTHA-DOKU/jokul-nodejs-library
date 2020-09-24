exports.getServerLocation = function (environment) {
    this.environment = environment;
    if (environment == 'sit') {
        return 'http://api-sit.doku.com/';
    } else if (environment == 'sandbox') {
        return 'https://sandbox.doku.com/';
    } else if (environment == 'production') {
        return 'https://api.doku.com/';
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
};

exports.PaymentCodeRequestDto = {
    client: {
        id: ""
    },
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
    security: {
        check_sum: ""
    }
}

exports.NotifyRequestDto = {
    client: {
        id:""
    },
    order: {
        invoice_number:"",
        amount:0
    },
    virtual_account_info: {
        virtual_account_number:""
    },
    virtual_account_payment: {
        date:"",
        systrace_number:"",
        reference_number:"",
        channel_code:""
    },
    security:{
        check_sum:""
    }
}

exports.NotifyResponseDto = {
    client: {
        id:""
    },
    order: {
        invoice_number:"",
        amount:0
    },
    virtual_account_info: {
        virtual_account_number:""
    },
    security:{
        check_sum:""
    }
}

exports.generateMandiriVa = function generateMandiriVa(serverLocation, paymentCodeRequest) {
    const request = require('sync-request');
    let res = request('POST',  serverLocation + 'mandiri-virtual-account/v1/payment-code', {
        json: paymentCodeRequest,
    });

    return JSON.parse(res.getBody('utf8'));
}
