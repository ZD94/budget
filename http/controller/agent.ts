/**
 * Created by lsw on 2017/10/19.
 */

"use strict";

import { AbstractController, Restful, Router } from "@jingli/restful";
import API from '@jingli/dnode-api';

@Restful('/agent')
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
}