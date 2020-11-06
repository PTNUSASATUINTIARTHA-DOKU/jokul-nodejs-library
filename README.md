# Jokul Node.js Library

Official Node.js Library for Jokul API. Visit [https://jokul.doku.com](https://jokul.doku.com) for more information about the product and [https://jokul.doku.com/docs](https://jokul.doku.com/docs) for the technical documentation.

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
  - [Setup Configuration](#setup-configuration)
  - [Virtual Account](#virtual-account)
- [Example](#example)
- [Help and Support](#help-and-support)

## Requirements

Node v10 or above <br />
Npm v6 or above

## Installation

### Npm
Run command `npm install jokul-nodejs-library --save && npm install sync-request --save && npm install crypto-js --save`

## Usage

### Setup Configuration

Get your Client ID and Shared Key from [Jokul Back Office](https://jokul.doku.com/bo/login).

Setup your configuration:

```javascript
const dokuLib = require('jokul-nodejs-library');

let setupConfiguration = dokuLib.SetupConfiguration;
    setupConfiguration.environment = 'sandbox'
    setupConfiguration.client_id = 'CLIENTID';
    setupConfiguration.merchant_name = 'MERCHANT_NAME';
    setupConfiguration.shared_key = 'SHARED_KEY';
    setupConfiguration.serverLocation = dokuLib.getServerLocation(setupConfiguration.environment);

```
#### Server Location
Sandbox: `"sandbox"`
Production: `"production"`

### Virtual Account
Prepare your request data:

```javascript
    const dokuLib = require('jokul-nodejs-library');

    let paymentCodeRequest = dokuLib.PaymentCodeRequestDto;
        paymentCodeRequest.customer.name = 'CUSTOMER_NAME';
        paymentCodeRequest.customer.email ='EMAIL';
        paymentCodeRequest.order.invoice_number = 'INVOICE NUMBER';
        paymentCodeRequest.order.amount = 10000;
        paymentCodeRequest.virtual_account_info.info1 = 'INFO1';
        paymentCodeRequest.virtual_account_info.info2 = 'INFO2';
        paymentCodeRequest.virtual_account_info.info3 = 'INFO3';
        paymentCodeRequest.virtual_account_info.reusable_status = false;
        paymentCodeRequest.virtual_account_info.expired_time = 60;
```

#### Mandiri VA

After preparing your request data, you can now generate the payment code / virtual account number:

```javascript
const dokuLib = require('jokul-nodejs-library');
 
dokuLib.generateMandiriVa(setupConfiguration, paymentCodeRequest);
```

#### DOKU VA

After preparing your request data, you can now generate the payment code / virtual account number:

```javascript
const dokuLib = require('jokul-nodejs-library');
 
dokuLib.generateDOKUVa(setupConfiguration, paymentCodeRequest);
```

#### Example Code - Virtual Account

Putting them all together. Here is the example code from setup your configuration to generate payment code / virtual account number:

```javascript
const dokuLib = require('jokul-nodejs-library');

var channel = req.body.channel;

    let setupConfiguration = dokuLib.SetupConfiguration;
    setupConfiguration.environment = req.body.environment;
    setupConfiguration.client_id = req.body.clientId;
    setupConfiguration.merchant_name = req.body.merchantName;
    setupConfiguration.shared_key = req.body.sharedKey;
    setupConfiguration.serverLocation = dokuLib.getServerLocation(setupConfiguration.environment);
    setupConfiguration.channel = channel;

    let paymentCodeRequest = dokuLib.PaymentCodeRequestDto;
    paymentCodeRequest.customer.name = req.body.customerName;
    paymentCodeRequest.customer.email = req.body.email;
    paymentCodeRequest.order.invoice_number = randomInvoice(30);
    paymentCodeRequest.order.amount = req.body.amount;
    paymentCodeRequest.virtual_account_info.info1 = req.body.info1;
    paymentCodeRequest.virtual_account_info.info2 = req.body.info2;
    paymentCodeRequest.virtual_account_info.info3 = req.body.info3;
    paymentCodeRequest.virtual_account_info.reusable_status = req.body.reusableStatus;
    paymentCodeRequest.virtual_account_info.expired_time = req.body.expiredTime != null ? req.body.expiredTime : '';

    (async function () {
        let response = await post(setupConfiguration, paymentCodeRequest, channel);
        res.send(response);
    })();

});

async function post(setupConfiguration, paymentCodeRequest, channel) {
    try {
        let response;

        if (channel == 'mandiri') {
            response = await dokuLib.generateMandiriVa(setupConfiguration, paymentCodeRequest);
        } else if (channel == 'doku') {
            response = await dokuLib.generateDOKUVa(setupConfiguration, paymentCodeRequest);
        } else if (channel == 'mandiri-syariah') {
            //do something
        }

        return response;
    } catch (error) {
        console.log(error);
        return null;
    }

}

```
### Notification
Notification is a class for receive payment information from DOKU, so merchant can use the Dto for Serialize object and Deserialize Object
Inbound Request Data :
```javascript
let notifyRequestDto = dokuLib.NotifyRequestDto;
notifyRequestDto.client.id = 'CLIENT-ID';
notifyRequestDto.order.invoice_number = 'INVOICE-NUMBER';
notifyRequestDto.order.amount = 10;
notifyRequestDto.virtual_account_info.virtual_account_number = 'VANUMBER';
notifyRequestDto.virtual_account_payment.date = 'DATE';
notifyRequestDto.virtual_account_payment.systrace_number = 'SYSTRACE-NUMBER';
notifyRequestDto.virtual_account_payment.reference_number = 'REFERENCE-NUMBER';
notifyRequestDto.virtual_account_payment.channel_code = 'CHANNEL-CODE';
notifyRequestDto.security.check_sum = 'CHECKSUM';

```
Outbound Response Data :
```javascript
let notifyResponseDto = dokuLib.NotifyResponseDto;

notifyResponseDto.client.id = 'CLIENT-ID';
notifyResponseDto.order.invoice_number = 'INVOICE-NUMBER';
notifyResponseDto.order.amount = 10;
notifyResponseDto.virtual_account_info.virtual_account_number = 'VANUMBER';
notifyResponseDto.security.check_sum = 'CHECKSUM';
```

## Example

Please refer to this repo for the example project: [Jokul Node JS Example](https://github.com/PTNUSASATUINTIARTHA-DOKU/jokul-nodejs-example).

## Help and Support

Got any issues? Found a bug? Have a feature requests? You can [open new issue](https://github.com/PTNUSASATUINTIARTHA-DOKU/jokul-nodejs-library/issues/new).

For further information, you can contact us on [care@doku.com](mailto:care@doku.com).
