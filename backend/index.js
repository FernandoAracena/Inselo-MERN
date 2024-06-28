import express from "express";
import {PORT, mongoDBURL, apiKey, userID} from "./config.js";
import mongoose from "mongoose";
import {Booking} from "./models/Booking.js"
import axios from 'axios';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    console.log(req);
    return res.status(234).send('Welcome to MERN');
});

const reqBody = {

  "consignments": [

    {

      "correlationId": "517796",

      "packages": [

        {

          "containerId": null,

          "correlationId": "517796",

          "dimensions": {

            "heightInCm": 3,

            "lengthInCm": 23,

            "widthInCm": 17

          },

          "goodsDescription": null,

          "packageType": null,

          "volumeInDm3": 2,

          "weightInKg": 5

        }

      ],

      "parties": {

        "pickupPoint": null,

        "recipient": {

          "additionalAddressInfo": null,

          "addressLine": "Bassengvegen 10",

          "addressLine2": null,

          "city": "Oslo",

          "contact": {

            "email": "aracenafernando@gmail.com",

            "name": "Demo Recipient Contact",

            "phoneNumber": "+4791234567"

          },

          "countryCode": "NO",

          "name": "Demo Recipient",

          "postalCode": "0185",

          "reference": null

        },

        "sender": {

          "additionalAddressInfo": null,

          "addressLine": "Industriveien 1",

          "addressLine2": null,

          "city": "Oslo",

          "contact": {

            "email": "aracenafernando@gmail.com",

            "name": "Demo Sender Contact",

            "phoneNumber": "+4792773783"

          },

          "countryCode": "NO",

          "name": "Demo Sender",

          "postalCode": "0010",

          "reference": "517796"

        }

      },

      "product": {
        "Customer": "PARCELS_NORWAY-00000000005",

        "customerNumber": "5",

        "id": "9000"

      },
      "generateQrCodes": true,

      "shippingDateTime": "2024-06-29T12:59:30"

    }

  ],

  "schemaVersion": 1,

  "testIndicator": true

};

app.post('/booking-return', async (req, res) => {    
    try {
        const { consignments, schemaVersion, testIndicator } = reqBody;

        if (!consignments || !Array.isArray(consignments) || consignments.length === 0) {
           throw new Error('The "consignments" field is required and must be a non-empty array.');
        }
        if (typeof schemaVersion === 'undefined') {
           throw new Error('The "schemaVersion" field is required.');
        }
        if (typeof testIndicator === 'undefined') {
           throw new Error('The "testIndicator" field is required.');
        }

        const payload = {
            consignments,
            schemaVersion,
            testIndicator
        };

        const res = await axios.post('https://api.bring.com/booking-api/api/booking', payload, {
            headers: {
                'X-Mybring-API-Uid': `${userID}`,
                'X-Mybring-API-Key': `${apiKey}`,
                'X-Bring-Client-URL': 'check.no',
                'Content-Type': 'application/json'
            }
        });

        const {trackingCode, qrCode } = res.consignments[0].data;

        const newBooking = new Booking({
            name: req.body.name,
            address: req.body.address,
            packageSize: req.body.packageSize,
            qrcode: res.consignments[0].confirmation.links.labels,
            trackingCode: res.consignments[0].confirmation.links.tracking,
        });

        await newBooking.save();
    } catch (error) {
        console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', JSON.stringify(error.response.headers, null, 2));
        throw new Error({message: error.message});
    }
});

app.get('/bookings', async (req, res) => {
    try{
        const bookings = await Booking.find();
        res.status(200).json(bookings);
    } catch(error){
        console.error('Failed to fetch bookings', error);
        res.status(500).json({message: 'Failed to fetch bookings', error: error.message});
    }
})

mongoose
    .connect(mongoDBURL)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`listening on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log(err);    
    });
