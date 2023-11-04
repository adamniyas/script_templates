/**
 * @NApiVersion 2.x
 * @NScriptType Portlet
 * @NModuleScope SameAccount
 */
define(['N', 'N/auth', 'N/config', 'N/crypto', 'N/currency', 'N/email', 'N/encode', 'N/error', 'N/file', 'N/format', 'N/http', 'N/https', 'N/plugin', 'N/portlet', 'N/record', 'N/redirect', 'N/render', 'N/runtime', 'N/search', 'N/sso', 'N/task', 'N/transaction', 'N/ui', 'N/ui/dialog', 'N/ui/message', 'N/ui/serverWidget', 'N/url', 'N/workflow', 'N/xml'],
/**
 * @param {N} N
 * @param {auth} auth
 * @param {config} config
 * @param {crypto} crypto
 * @param {currency} currency
 * @param {email} email
 * @param {encode} encode
 * @param {error} error
 * @param {file} file
 * @param {format} format
 * @param {http} http
 * @param {https} https
 * @param {plugin} plugin
 * @param {portlet} portlet
 * @param {record} record
 * @param {redirect} redirect
 * @param {render} render
 * @param {runtime} runtime
 * @param {search} search
 * @param {sso} sso
 * @param {task} task
 * @param {transaction} transaction
 * @param {ui} ui
 * @param {dialog} dialog
 * @param {message} message
 * @param {serverWidget} serverWidget
 * @param {url} url
 * @param {workflow} workflow
 * @param {xml} xml
 */
function(N, auth, config, crypto, currency, email, encode, error, file, format, http, https, plugin, portlet, record, redirect, render, runtime, search, sso, task, transaction, ui, dialog, message, serverWidget, url, workflow, xml) {
   
    /**
     * Definition of the Portlet script trigger point.
     * 
     * @param {Object} params
     * @param {Portlet} params.portlet - The portlet object used for rendering
     * @param {number} params.column - Specifies whether portlet is placed in left (1), center (2) or right (3) column of the dashboard
     * @param {string} params.entity - (For custom portlets only) references the customer ID for the selected customer
     * @Since 2015.2
     */
    function render(params) {

    }

    return {
        render: render
    };
    
});
