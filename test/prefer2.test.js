/**
 * Created by wlh on 2018/3/8.
 */
'use strict';

require("ts-node").register({fast: true});
//
require('./model/budget/prefer/ticket-arrivaltime.test.ts')
require('./model/budget/prefer/ticket-departtime.test.ts')
require('./model/budget/prefer/ticket-cheapsupplier.test')
require('./model/budget/prefer/ticket-departStandardTimePrefer.test')
require('./model/budget/prefer/ticket-cabin.test')
require('./model/budget/prefer/ticket-runningTimePrefer.test')
require('./model/budget/prefer/ticket-arriveStandardTimePrefer.test')
require('./model/budget/prefer/ticket-trainDurationPrefer.test')
require('./model/budget/prefer/ticket-latestArrivalTimePrefer.test')
require('./model/budget/prefer/ticket-earliestGoBackTimePrefer.test')
require('./model/budget/prefer/ticket-trainPricePrefer.test')



