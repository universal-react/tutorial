import React from 'react';
import { connect } from 'react-redux';

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

  handleBtnClick = () => {
    this.props.toogleBlankVisible();
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
        </div>
        <div className={styles.right}>
          
        </div>
      </header>
      <div>
          {userListDOM}
        </div>
        <button className={styles.button} onClick={this.handleBtnClick}>clicks</button>
        {blankVisible ?
          <div className={styles.blank}>blank</div>
          : null}
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
