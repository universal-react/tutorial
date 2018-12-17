import React from 'react';
import { connect } from 'react-redux';

import { Button } from 'antd';

import {
  getInitialData,
  getUserList,
  toogleBlankVisible,
} from './action';
import styles from './home.scss';

class Home extends React.Component<any, any> {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.getInitialData();
  }

  render() {
    const { list, blankVisible, dispatch } = this.props;
    const userListDOM = list.map((v, i) =>
      (
        <span key={i}>
          the peopleName: {v.name}
          <input type="checkbox" />
        </span>
      ));

    return (
      <div className={styles.red}>
        <header className={styles.header}>
          <div className={styles.left}>
            <span>友聘</span>
            <a href="">进入企业版</a>
          </div>
          <div className={styles.right}>
            <div className={styles.avatar} />
            <span>姚大胆</span>
          </div>
        </header>
        <div className={styles.mainContainer}>
          <div className={styles.left}>
            <div className={styles.userInfoContainer}>
              <div className={styles.bigAvatar} />
              <div className={styles.userInfo}>
                <p className={styles.userName}>姚大胆</p>
                <p>技术总监</p>
                <p>6年经验 ·本科 · 北京 </p>
                <p>
                  <span>
                    <span>13521692060</span>
                  </span>
                  <span><span>3465934659@qq.com</span></span>
                </p>
              </div>
            </div>
          </div>
          <div className={styles.right}>
            <Button type="primary">hh</Button>
          </div>
        </div>
      </div>
    );
  }
}

(Home as any).title = 'this is home page';
(Home as any).getInitialData = getInitialData;

const mapState2Props = store => {
  return { ...store.home };
};

export default connect(mapState2Props, {
  getUserList,
  getInitialData,
  toogleBlankVisible,
})(Home);
