import React from "react";

import "antd/dist/antd.css";
import { Menu, Drawer, Button } from "antd";
import {
  GithubOutlined,
  HomeOutlined,
  LoginOutlined,
  MenuOutlined,
  BarChartOutlined
} from "@ant-design/icons";
import "../navbar.scss";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import homePage from "../../home";
import playlistPage from "../../normal-playlist/playlist";
import concertPlaylistPage from "../../concert-playlist/ZipForm";
import Statistics from "../../statistics/statistics";

const { SubMenu } = Menu;

class MobileLoggedInBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current: "mail",
      visible: false,
      width: 395,
    };
  }

  handleClick = (e) => {
    this.setState({ current: e.key });
  };

  toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  render() {
    const { current } = this.state;
    return (
      <Router>
        <div className="navbarContainer">
          <div>
            <h1>Playlist App</h1>
          </div>
          <Button
            id="mobile-menu-button"
            type="link"
            icon={<MenuOutlined />}
            className="mobile-btn"
            onClick={() => {
              this.setState({
                visible: !this.state.visible,
                width: window.innerWidth < 450 ? 300 : 385,
              });
            }}
          />
          <Drawer
            width={this.state.width}
            visible={this.state.visible}
            placement="right"
            onClose={() => this.setState({ visible: false })}
            className="mobile-menu"
          >
            <Menu
              onClick={this.handleClick}
              selectedKeys={[current]}
              defaultSelectedKeys={["1"]}
              defaultOpenKeys={["sub1"]}
              mode="inline"
              inlineCollapsed={this.state.collapsed}
            >
              <Menu.Item id="home" key="home" icon={<HomeOutlined />}>
                <a href="/">Playlist App</a>
              </Menu.Item>
              <Menu.Item key="statistics" icon={<BarChartOutlined />}>
                <a href="/statistics">Statistics</a>
              </Menu.Item>
              <Menu.Item key="github" icon={<GithubOutlined />}>
                <a href="https://github.com/csjoblinksreddit/playlistapplication">
                  Github
                </a>
              </Menu.Item>
              <Menu.Item id="login" key="login" icon={<LoginOutlined />}>
              <a href="http://3.139.102.236:8888">Log In</a>
              </Menu.Item>
            </Menu>
          </Drawer>
        </div>
        <Switch>
          <Route exact path="/" component={homePage} />
          <Route exact path="/playlist" component={playlistPage} />
          <Route exact path="/concertPlaylist" component={concertPlaylistPage} />
          <Route exact path="/statistics" component={Statistics} />
        </Switch>
      </Router>
    );
  }
}

export default MobileLoggedInBar;
