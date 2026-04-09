import React, { Component } from 'react';
import { connect } from 'react-redux';
import './PaymentQr.scss';

const DEFAULT_BANK = 'VCB';

class PaymentQr extends Component {
    state = {
        bankCode: DEFAULT_BANK,
        accountNo: '',
        accountName: '',
        amount: '',
        addInfo: '',
        template: 'compact2'
    };

    componentDidMount() {
        const { userInfo } = this.props;
        this.setState({
            accountName: `${userInfo?.lastName || ''} ${userInfo?.firstName || ''}`.trim()
        });
    }

    handleChangeField = (event, field) => {
        const value = event.target.value;
        this.setState({ [field]: value });
    };

    buildQrUrl = () => {
        const { bankCode, accountNo, template } = this.state;
        if (!bankCode || !accountNo) return '';

        const params = new URLSearchParams();
        if (this.state.accountName) params.append('accountName', this.state.accountName);
        if (this.state.amount) params.append('amount', this.state.amount);
        if (this.state.addInfo) params.append('addInfo', this.state.addInfo);

        return `https://img.vietqr.io/image/${bankCode}-${accountNo}-${template}.png?${params.toString()}`;
    };

    downloadQr = async () => {
        const qrUrl = this.buildQrUrl();
        if (!qrUrl) return;

        try {
            const response = await fetch(qrUrl);
            const blob = await response.blob();
            const objectUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = `doctor-payment-qr-${this.state.accountNo || 'download'}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(objectUrl);
        } catch (error) {
            window.open(qrUrl, '_blank', 'noopener,noreferrer');
        }
    };

    render() {
        const qrUrl = this.buildQrUrl();

        return (
            <div className="payment-qr-page">
                <div className="payment-qr-hero">
                    <div>
                        <div className="eyebrow">Doctor workspace</div>
                        <h1>Tao QR thanh toan cho khach hang</h1>
                        <p>Nhap thong tin nhan tien de hien ma QR chuyen khoan ngay tren man hinh.</p>
                    </div>
                    <div className="hero-chip">Role doctor only</div>
                </div>

                <div className="payment-qr-layout">
                    <div className="payment-qr-form-card">
                        <div className="card-title">Thong tin thanh toan</div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Ma ngan hang</label>
                                <input
                                    className="form-control"
                                    value={this.state.bankCode}
                                    onChange={(event) => this.handleChangeField(event, 'bankCode')}
                                    placeholder="VD: VCB, ACB, TCB, MBBANK"
                                />
                            </div>

                            <div className="form-group">
                                <label>So tai khoan</label>
                                <input
                                    className="form-control"
                                    value={this.state.accountNo}
                                    onChange={(event) => this.handleChangeField(event, 'accountNo')}
                                    placeholder="Nhap so tai khoan nhan tien"
                                />
                            </div>

                            <div className="form-group">
                                <label>Ten chu tai khoan</label>
                                <input
                                    className="form-control"
                                    value={this.state.accountName}
                                    onChange={(event) => this.handleChangeField(event, 'accountName')}
                                    placeholder="Nhap ten chu tai khoan"
                                />
                            </div>

                            <div className="form-group">
                                <label>So tien</label>
                                <input
                                    className="form-control"
                                    type="number"
                                    value={this.state.amount}
                                    onChange={(event) => this.handleChangeField(event, 'amount')}
                                    placeholder="VD: 300000"
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Noi dung thanh toan</label>
                                <input
                                    className="form-control"
                                    value={this.state.addInfo}
                                    onChange={(event) => this.handleChangeField(event, 'addInfo')}
                                    placeholder="VD: Thanh toan kham benh Nguyen Van A"
                                />
                            </div>
                        </div>

                        <div className="hint-list">
                            <div>Khach co the quet QR bang ung dung ngan hang.</div>
                            <div>Chi can dien ma ngan hang va so tai khoan la co the tao QR.</div>
                        </div>
                    </div>

                    <div className="payment-qr-preview-card">
                        <div className="card-title">Xem truoc QR</div>

                        {qrUrl ? (
                            <>
                                <div className="qr-preview-box">
                                    <img src={qrUrl} alt="Payment QR" />
                                </div>
                                <div className="qr-meta">
                                    <div><strong>Ngan hang:</strong> {this.state.bankCode}</div>
                                    <div><strong>So tai khoan:</strong> {this.state.accountNo}</div>
                                    <div><strong>So tien:</strong> {this.state.amount || 'Khach tu nhap'}</div>
                                </div>
                                <button type="button" className="btn-download-qr" onClick={this.downloadQr}>
                                    Tai ma QR
                                </button>
                            </>
                        ) : (
                            <div className="qr-empty-state">
                                Dien ma ngan hang va so tai khoan de hien QR thanh toan.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    userInfo: state.user.userInfo
});

export default connect(mapStateToProps)(PaymentQr);
