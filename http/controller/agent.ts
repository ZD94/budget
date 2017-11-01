/**
 * Created by lsw on 2017/10/19.
 */

"use strict";

import { AbstractController, Restful, Router } from "@jingli/restful";
import API from '@jingli/dnode-api';

@Restful()
export class AgentController extends AbstractController {
    $isValidId(id: string): boolean {
        return /^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(id);
    }

    @Router('/company/:id/token', 'get')
    async getAgentToken(req, res, next) {
        const { id } = req.params;
        const { token } = req.headers;

        const result = await API['auth'].getTokenByAgent(token, id);
        if (result.code == 0) {
            return res.json(this.reply(0, result.data));
        }
        return res.json(this.reply(result.code, null));
    }


    @Router('/gettoken', 'post')
    async tokenByCompany(req, res, next) {
        const { appId, sign, timestamp } = req.body;
        if(!sign || !timestamp) {
            return res.send(this.reply(401, null));
        }

        const resp = await API['auth'].getCompanyToken(appId, sign, timestamp);
        if(resp.code === 0) {
            return res.send(this.reply(0, resp.data));
        }
        return res.send(this.reply(400, null));
    }

    @Router('/refresh', 'get')
    async refreshToken(req, res, next) {
        const { token } = req.headers;
        if(!token) return res.sendStatus(403);
        
        const resp = await API['auth'].refreshToken(token);

        if(resp.code == 0) {
            return res.send(this.reply(0, resp.data));
        }
        return resp.send(this.reply(resp.code, null));
    }

}