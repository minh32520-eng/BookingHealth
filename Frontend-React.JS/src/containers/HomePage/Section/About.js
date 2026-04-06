import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
class About extends Component {

    render() {
        return (

            <div className=" section-share section-about">
                <div className="section-about-header">
                    TRuyen thong noi ve Minh dep trai
                </div>
                <div className="section-about-content">
                    <div className="content-left">
                        <iframe width="100%" height="400px" src="https://www.youtube.com/embed/qO3FlyihcSo" title="Hoàng Đế Ép Tôi Tạo Phản... Tôi Có 80 Vạn Đại Quân | Sub Review Official" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin"
                            allowFullScreen></iframe>
                    </div>
                    <div className="content-right">
                        1. You are gentleman: Anh là người hào hoa phong nhã

                        Ví dụ: Suddenly, I said "You are gentleman" and he smiled and twinkled me (Bất ngờ tôi thốt lên: "Anh là người hào hoa phong nhã". And ấy mỉm cười và nháy mắt với tôi).

                        2. You are very handsome: Anh thật đẹp trai

                        Ví dụ: Any man wants to be told "You are very handsome" (Bất cứ người đàn ông nào cũng muốn được nghe câu: "Anh thật đẹp trai).

                        3. You are a qualified man: Anh là một người đàn ông có tư cách

                        Ví dụ: When I gave him the comment "You are a qualified man", he asked me for my phone number (Khi tôi nhận xét: "Anh là một người đàn ông có tư cách", anh ấy liền hỏi xin tôi số điện thoại).

                        4. I am so lucky to have you in my life: Em thật may mắn khi có anh trong đời

                        Ví dụ: After a sweet kiss, I said "I am so lucky to have you in my life" (Sau nụ hôn ngọt ngào tôi nói: "Em thật may mắn khi có anh trong đời).

                        5. I appreciate your love: Em trân trọng tình yêu của anh dành cho em

                        Ví dụ: In bottom of my heart, I always appreciate your love (Tận trong trái tim em, em luôn trân trọng tình yêu anh dành cho em).
                    </div>
                </div>
            </div>
        );
    }
}


const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(About);
