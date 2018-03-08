/**
 * Created by wlh on 2018/3/8.
 */
'use strict';

require("ts-node").register({fast: true});

// require('./model/budget/prefer/hotel-blacklist.test.ts');
// require('./model/budget/prefer/ticket-arrivaltime.test.ts')
// require('./model/budget/prefer/ticket-departtime.test.ts')
// require('model/budget/prefer/ticket-cheapsupplier.test')
// require('model/budget/prefer/ticket-cabin.test')
// require('model/budget/prefer/ticket-runningTimePrefer.test')
// require('model/budget/prefer/ticket-departStandardTimePrefer.test')

require('./model/budget/prefer/hotel-blacklist.test');
require('./model/budget/prefer/ticket-refusedPlane.test');
require('./model/budget/prefer/ticket-compareTrainPlanePrice.test');
require('./model/budget/prefer/ticket-transitCityInChina');

