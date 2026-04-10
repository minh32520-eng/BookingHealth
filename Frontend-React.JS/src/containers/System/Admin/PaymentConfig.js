import React, { Component } from 'react';
import { toast } from 'react-toastify';
import { FormattedMessage, injectIntl } from 'react-intl';
import { getPaymentConfig, savePaymentConfig } from '../../../services/userService';
import './PaymentConfig.scss';

class PaymentConfig extends Component {
    state = {
        loading: true,
        saving: false,
        bankCode: '',
        bankName: '',
        accountNumber: '',
        accountName: '',
        defaultTransferContent: 'BOOKING',
        qrProvider: 'vietqr',
        isActive: true
    };

    componentDidMount() {
        this.loadConfig();
    }

    loadConfig = async () => {
        this.setState({ loading: true });
        try {
            const res = await getPaymentConfig();
            if (res && res.errCode === 0 && res.data) {
                this.setState({
                    loading: false,
                    bankCode: res.data.bankCode || '',
                    bankName: res.data.bankName || '',
                    accountNumber: res.data.accountNumber || '',
                    accountName: res.data.accountName || '',
                    defaultTransferContent: res.data.defaultTransferContent || 'BOOKING',
                    qrProvider: res.data.qrProvider || 'vietqr',
                    isActive: res.data.isActive !== false
                });
                return;
            }
        } catch (error) {}

        this.setState({ loading: false });
    };

    handleChange = (field, event) => {
        const value = field === 'isActive' ? event.target.checked : event.target.value;
        this.setState({ [field]: value });
    };

    handleSave = async () => {
        const { intl } = this.props;
        const { bankCode, bankName, accountNumber, accountName, defaultTransferContent, qrProvider, isActive } = this.state;

        if (!accountNumber || !accountName) {
            toast.error(intl.formatMessage({ id: 'admin.payment-config.messages.missing-fields' }));
            return;
        }

        this.setState({ saving: true });
        try {
            const res = await savePaymentConfig({
                bankCode,
                bankName,
                accountNumber,
                accountName,
                defaultTransferContent,
                qrProvider,
                isActive
            });

            if (res && res.errCode === 0) {
                toast.success(intl.formatMessage({ id: 'admin.payment-config.messages.save-success' }));
                this.loadConfig();
                return;
            }

            toast.error(res?.errMessage || intl.formatMessage({ id: 'admin.payment-config.messages.save-failed' }));
        } catch (error) {
            toast.error(intl.formatMessage({ id: 'admin.payment-config.messages.save-failed' }));
        } finally {
            this.setState({ saving: false });
        }
    };

    buildPreviewQr = () => {
        const { bankCode, accountNumber, accountName, defaultTransferContent, qrProvider } = this.state;
        if (qrProvider !== 'vietqr' || !bankCode || !accountNumber || !accountName) {
            return '';
        }

        return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=500000&addInfo=${encodeURIComponent(`${defaultTransferContent || 'BOOKING'} 123`)}&accountName=${encodeURIComponent(accountName)}`;
    };

    render() {
        const { loading, saving, bankCode, bankName, accountNumber, accountName, defaultTransferContent, qrProvider, isActive } = this.state;
        const previewQr = this.buildPreviewQr();

        return (
            <div className="payment-config-page">
                <div className="payment-config-shell">
                    <div className="payment-config-hero">
                        <div className="payment-config-eyebrow"><FormattedMessage id="admin.payment-config.eyebrow" /></div>
                        <h1><FormattedMessage id="admin.payment-config.title" /></h1>
                        <p><FormattedMessage id="admin.payment-config.subtitle" /></p>
                    </div>

                    <div className="payment-config-grid">
                        <div className="payment-config-card">
                            <div className="payment-config-card-head">
                                <h3><FormattedMessage id="admin.payment-config.form.title" /></h3>
                            </div>

                            {loading ? (
                                <div className="payment-config-loading"><FormattedMessage id="admin.payment-config.loading" /></div>
                            ) : (
                                <div className="payment-config-form">
                                    <div className="form-row two-columns">
                                        <div className="form-group">
                                            <label><FormattedMessage id="admin.payment-config.form.bank-code" /></label>
                                            <input value={bankCode} onChange={(event) => this.handleChange('bankCode', event)} placeholder="VCB" />
                                        </div>
                                        <div className="form-group">
                                            <label><FormattedMessage id="admin.payment-config.form.bank-name" /></label>
                                            <input value={bankName} onChange={(event) => this.handleChange('bankName', event)} placeholder="Vietcombank" />
                                        </div>
                                    </div>

                                    <div className="form-row two-columns">
                                        <div className="form-group">
                                            <label><FormattedMessage id="admin.payment-config.form.account-number" /></label>
                                            <input value={accountNumber} onChange={(event) => this.handleChange('accountNumber', event)} />
                                        </div>
                                        <div className="form-group">
                                            <label><FormattedMessage id="admin.payment-config.form.account-name" /></label>
                                            <input value={accountName} onChange={(event) => this.handleChange('accountName', event)} />
                                        </div>
                                    </div>

                                    <div className="form-row two-columns">
                                        <div className="form-group">
                                            <label><FormattedMessage id="admin.payment-config.form.default-content" /></label>
                                            <input value={defaultTransferContent} onChange={(event) => this.handleChange('defaultTransferContent', event)} placeholder="BOOKING" />
                                        </div>
                                        <div className="form-group">
                                            <label><FormattedMessage id="admin.payment-config.form.qr-provider" /></label>
                                            <select value={qrProvider} onChange={(event) => this.handleChange('qrProvider', event)}>
                                                <option value="vietqr">VietQR</option>
                                            </select>
                                        </div>
                                    </div>

                                    <label className="toggle-row">
                                        <input type="checkbox" checked={isActive} onChange={(event) => this.handleChange('isActive', event)} />
                                        <span><FormattedMessage id="admin.payment-config.form.active" /></span>
                                    </label>

                                    <button className="save-config-btn" onClick={this.handleSave} disabled={saving}>
                                        <FormattedMessage id={saving ? 'admin.payment-config.actions.saving' : 'admin.payment-config.actions.save'} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="payment-preview-card">
                            <div className="payment-config-card-head">
                                <h3><FormattedMessage id="admin.payment-config.preview.title" /></h3>
                            </div>
                            <div className="payment-preview-meta">
                                <div>
                                    <span><FormattedMessage id="admin.payment-config.preview.bank" /></span>
                                    <strong>{bankName || '--'} {bankCode ? `(${bankCode})` : ''}</strong>
                                </div>
                                <div>
                                    <span><FormattedMessage id="admin.payment-config.preview.account" /></span>
                                    <strong>{accountNumber || '--'}</strong>
                                </div>
                                <div>
                                    <span><FormattedMessage id="admin.payment-config.preview.holder" /></span>
                                    <strong>{accountName || '--'}</strong>
                                </div>
                                <div>
                                    <span><FormattedMessage id="admin.payment-config.preview.content" /></span>
                                    <strong>{`${defaultTransferContent || 'BOOKING'} 123`}</strong>
                                </div>
                            </div>
                            {previewQr ? (
                                <div className="payment-preview-qr">
                                    <img src={previewQr} alt="Payment QR preview" />
                                </div>
                            ) : (
                                <div className="payment-preview-empty">
                                    <FormattedMessage id="admin.payment-config.preview.empty" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default injectIntl(PaymentConfig);
