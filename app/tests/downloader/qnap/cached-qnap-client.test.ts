import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import QnapClient from "../../../src/downloader/qnap/qnap-client";
import axios from "axios";
import CachedQnapClient from "../../../src/downloader/qnap/cached-qnap-client";

jest.mock('axios');
describe(CachedQnapClient.name, () => {
    let client: CachedQnapClient;
    const mockedAxios = axios as jest.Mocked<typeof axios>;

    beforeEach(() => {
        client = new CachedQnapClient('http://localhost:8080/', 'username', 'password');
        mockedAxios.get.mockReset();
        mockedAxios.post.mockReset();
    })

    test('query tasks', async () => {

        mockedAxios.post.mockResolvedValue({
            status: 200,
            data: '<?xml version="1.0" encoding="UTF-8" ?><QDocRoot version="1.0"><doQuick><![CDATA[]]></doQuick><is_booting><![CDATA[0]]></is_booting><mediaReady><![CDATA[1]]></mediaReady><shutdown_info><type><![CDATA[-1]]></type><timestamp><![CDATA[0]]></timestamp><duration><![CDATA[0]]></duration></shutdown_info><pw_status><![CDATA[0]]></pw_status><authPassed><![CDATA[1]]></authPassed><SMBFW><![CDATA[0]]></SMBFW><hero_model><![CDATA[0]]></hero_model><qts_mode_type><![CDATA[0]]></qts_mode_type><user_enable><![CDATA[1]]></user_enable><user_account_expiry><![CDATA[0]]></user_account_expiry><authSid><![CDATA[foo]]></authSid><role_delegation></role_delegation><isAdmin><![CDATA[0]]></isAdmin><userid><![CDATA[1001]]></userid><userType><![CDATA[local]]></userType><user_pw_change><![CDATA[1]]></user_pw_change><username><![CDATA[foo]]></username><groupname><![CDATA[everyone]]></groupname><ts><![CDATA[1231231]]></ts><fwNotice><![CDATA[0]]></fwNotice><title><![CDATA[]]></title><content><![CDATA[]]></content><psType><![CDATA[1]]></psType><standard_massage><![CDATA[]]></standard_massage><standard_color><![CDATA[#ffffff]]></standard_color><standard_size><![CDATA[12px]]></standard_size><standard_bg_style><![CDATA[fill]]></standard_bg_style><showVersion><![CDATA[0]]></showVersion><show_link><![CDATA[1]]></show_link><cuid><![CDATA[b53f5fb02527547096eff3baf8eb24e2]]></cuid><auth_method><![CDATA[ck]]></auth_method><mfa_support></mfa_support><function_support><![CDATA[redirect_url,xs-auth-redirect,passwordless_login,multi_2sv,app_privilege]]></function_support></QDocRoot>',
        });

        // @ts-ignore
        mockedAxios.get.mockResolvedValue({
            status: 200,
            data: {
                data: [
                    {
                        progress: 100,
                        state: 5,
                        source: 'http://fooo.bar'
                    }
                ]
            },
        });

        let response = await client.tasksQuery();

        expect(response).toEqual({
            data: [
                {
                    progress: 100,
                    state: 5,
                    source: 'http://fooo.bar'
                }
            ]
        })

        response = await client.tasksQuery();

        expect(response).toEqual({
            data: [
                {
                    progress: 100,
                    state: 5,
                    source: 'http://fooo.bar'
                }
            ]
        })

        // Wait 1sec for testing cache
        await new Promise((resolve) => {
            setTimeout(resolve, 1000);
        })

        response = await client.tasksQuery();

        expect(response).toEqual({
            data: [
                {
                    progress: 100,
                    state: 5,
                    source: 'http://fooo.bar'
                }
            ]
        })

        expect(mockedAxios.get).toHaveBeenCalledWith(
            'http://localhost:8080/downloadstation/V4/Task/Query',
            {
                params: {
                    sid: 'foo',
                    field: 'create_time',
                    direction: 'DESC'
                }
            }
        )
        expect(mockedAxios.get).toBeCalledTimes(2);
    })

    test('query one task', async () => {

        mockedAxios.post.mockResolvedValue({
            status: 200,
            data: '<?xml version="1.0" encoding="UTF-8" ?><QDocRoot version="1.0"><doQuick><![CDATA[]]></doQuick><is_booting><![CDATA[0]]></is_booting><mediaReady><![CDATA[1]]></mediaReady><shutdown_info><type><![CDATA[-1]]></type><timestamp><![CDATA[0]]></timestamp><duration><![CDATA[0]]></duration></shutdown_info><pw_status><![CDATA[0]]></pw_status><authPassed><![CDATA[1]]></authPassed><SMBFW><![CDATA[0]]></SMBFW><hero_model><![CDATA[0]]></hero_model><qts_mode_type><![CDATA[0]]></qts_mode_type><user_enable><![CDATA[1]]></user_enable><user_account_expiry><![CDATA[0]]></user_account_expiry><authSid><![CDATA[foo]]></authSid><role_delegation></role_delegation><isAdmin><![CDATA[0]]></isAdmin><userid><![CDATA[1001]]></userid><userType><![CDATA[local]]></userType><user_pw_change><![CDATA[1]]></user_pw_change><username><![CDATA[foo]]></username><groupname><![CDATA[everyone]]></groupname><ts><![CDATA[1231231]]></ts><fwNotice><![CDATA[0]]></fwNotice><title><![CDATA[]]></title><content><![CDATA[]]></content><psType><![CDATA[1]]></psType><standard_massage><![CDATA[]]></standard_massage><standard_color><![CDATA[#ffffff]]></standard_color><standard_size><![CDATA[12px]]></standard_size><standard_bg_style><![CDATA[fill]]></standard_bg_style><showVersion><![CDATA[0]]></showVersion><show_link><![CDATA[1]]></show_link><cuid><![CDATA[b53f5fb02527547096eff3baf8eb24e2]]></cuid><auth_method><![CDATA[ck]]></auth_method><mfa_support></mfa_support><function_support><![CDATA[redirect_url,xs-auth-redirect,passwordless_login,multi_2sv,app_privilege]]></function_support></QDocRoot>',
        });

        // @ts-ignore
        mockedAxios.get.mockResolvedValue({
            status: 200,
            data: {
                data: [
                    {
                        progress: 100,
                        state: 5,
                        source: 'http://fooo.bar'
                    }
                ]
            },
        });

        let response = await client.getTaskWithUrl('http://fooo.bar');

        expect(response).toEqual({
            progress: 100,
            state: 5,
            source: 'http://fooo.bar'
        });

        response = await client.getTaskWithUrl('http://fooo.bar');

        expect(response).toEqual({
            progress: 100,
            state: 5,
            source: 'http://fooo.bar'
        });

        // Wait 1sec for testing cache
        await new Promise((resolve) => {
            setTimeout(resolve, 1000);
        })

        response = await client.getTaskWithUrl('http://fooo.bar');

        expect(response).toEqual({
            progress: 100,
            state: 5,
            source: 'http://fooo.bar'
        });

        expect(mockedAxios.get).toHaveBeenCalledWith(
            'http://localhost:8080/downloadstation/V4/Task/Query',
            {
                params: {
                    sid: 'foo',
                    field: 'create_time',
                    direction: 'DESC'
                }
            }
        )
        expect(mockedAxios.get).toBeCalledTimes(2);
    })
})
