import './View.scss';
import React, { PureComponent as Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Icon, Row, Col, message } from 'antd';
// import { Link } from 'react-router-dom';
import AceEditor from 'client/components/AceEditor/AceEditor';
// import { formatTime } from '../../common.js';
import variable from '../../constants/variable';
import constants from '../../constants/variable.js';
import SchemaTable from '../../components/SchemaTable/SchemaTable.js';
import axios from 'axios';

const HTTP_METHOD = constants.HTTP_METHOD;

class View extends Component {
  constructor(props) {
    super(props);
    this.state = {
      curData: {},
      enter: false
    };
  }
  static propTypes = {
    match: PropTypes.object
  };

  req_body_form(req_body_type, req_body_form) {
    if (req_body_type === 'form') {
      const columns = [
        {
          title: '参数名称',
          dataIndex: 'name',
          key: 'name',
          width: 140
        },
        {
          title: '参数类型',
          dataIndex: 'type',
          key: 'type',
          width: 100,
          render: text => {
            text = text || '';
            return text.toLowerCase() === 'text' ? (
              <span>
                <i className="query-icon text">T</i>文本
              </span>
            ) : (
              <span>
                <Icon type="file" className="query-icon" />文件
              </span>
            );
          }
        },
        {
          title: '是否必须',
          dataIndex: 'required',
          key: 'required',
          width: 100
        },
        {
          title: '示例',
          dataIndex: 'example',
          key: 'example',
          width: 80,
          render(_, item) {
            return <p style={{ whiteSpace: 'pre-wrap' }}>{item.example}</p>;
          }
        },
        {
          title: '备注',
          dataIndex: 'value',
          key: 'value',
          render(_, item) {
            return <p style={{ whiteSpace: 'pre-wrap' }}>{item.value}</p>;
          }
        }
      ];

      const dataSource = [];
      if (req_body_form && req_body_form.length) {
        req_body_form.map((item, i) => {
          dataSource.push({
            key: i,
            name: item.name,
            value: item.desc,
            example: item.example,
            required: item.required == 0 ? '否' : '是',
            type: item.type
          });
        });
      }

      return (
        <div style={{ display: dataSource.length ? '' : 'none' }} className="colBody">
          <Table
            bordered
            size="small"
            pagination={false}
            columns={columns}
            dataSource={dataSource}
          />
        </div>
      );
    }
  }
  res_body(res_body_type, res_body, res_body_is_json_schema) {
    if (res_body_type === 'json') {
      if (res_body_is_json_schema) {
        return <SchemaTable dataSource={res_body} />;
      } else {
        return (
          <div className="colBody">
            {/* <div id="vres_body_json" style={{ minHeight: h * 16 + 100 }}></div> */}
            <AceEditor data={res_body} readOnly={true} style={{ minHeight: 600 }} />
          </div>
        );
      }
    } else if (res_body_type === 'raw') {
      return (
        <div className="colBody">
          <AceEditor data={res_body} readOnly={true} mode="text" style={{ minHeight: 300 }} />
        </div>
      );
    }
  }

  req_body(req_body_type, req_body_other, req_body_is_json_schema) {
    if (req_body_other) {
      if (req_body_is_json_schema && req_body_type === 'json') {
        return <SchemaTable dataSource={req_body_other} />;
      } else {
        return (
          <div className="colBody">
            <AceEditor
              data={req_body_other}
              readOnly={true}
              style={{ minHeight: 300 }}
              mode={req_body_type === 'json' ? 'javascript' : 'text'}
            />
          </div>
        );
      }
    }
  }

  req_query(query) {
    const columns = [
      {
        title: '参数名称',
        dataIndex: 'name',
        width: 140,
        key: 'name'
      },
      {
        title: '是否必须',
        width: 100,
        dataIndex: 'required',
        key: 'required'
      },
      {
        title: '示例',
        dataIndex: 'example',
        key: 'example',
        width: 80,
        render(_, item) {
          return <p style={{ whiteSpace: 'pre-wrap' }}>{item.example}</p>;
        }
      },
      {
        title: '备注',
        dataIndex: 'value',
        key: 'value',
        render(_, item) {
          return <p style={{ whiteSpace: 'pre-wrap' }}>{item.value}</p>;
        }
      }
    ];

    const dataSource = [];
    if (query && query.length) {
      query.map((item, i) => {
        dataSource.push({
          key: i,
          name: item.name,
          value: item.desc,
          example: item.example,
          required: item.required == 0 ? '否' : '是'
        });
      });
    }

    return (
      <Table bordered size="small" pagination={false} columns={columns} dataSource={dataSource} />
    );
  }

  countEnter(str) {
    let i = 0;
    let c = 0;
    if (!str || !str.indexOf) {
      return 0;
    }
    while (str.indexOf('\n', i) > -1) {
      i = str.indexOf('\n', i) + 2;
      c++;
    }
    return c;
  }

  getInterfaceInfo() {
    let id = window.location.search.split('id=')[1]
    axios.get('/api/open/interface_get?id=' + id).then(res => {
      let result = res.data;
      if(!result.data) {
        message.error(result.errmsg)
        return false
      }
      this.setState({
        curData: result.data
      })
    });
  }

  componentDidMount() {
    this.getInterfaceInfo();
  }

  enterItem = () => {
    this.setState({
      enter: true
    });
  };

  leaveItem = () => {
    this.setState({
      enter: false
    });
  };

  flagMsg = (mock, strice) => {
    if (mock && strice) {
      return <span>( 全局mock & 严格模式 )</span>;
    } else if (!mock && strice) {
      return <span>( 严格模式 )</span>;
    } else if (mock && !strice) {
      return <span>( 全局mock )</span>;
    } else {
      return;
    }
  };

  render() {
    const dataSource = [];
    if (this.state.curData.req_headers && this.state.curData.req_headers.length) {
      this.state.curData.req_headers.map((item, i) => {
        dataSource.push({
          key: i,
          name: item.name,
          required: item.required == 0 ? '否' : '是',
          value: item.value,
          example: item.example,
          desc: item.desc
        });
      });
    }

    const req_dataSource = [];
    if (this.state.curData.req_params && this.state.curData.req_params.length) {
      this.state.curData.req_params.map((item, i) => {
        req_dataSource.push({
          key: i,
          name: item.name,
          desc: item.desc,
          example: item.example
        });
      });
    }
    const req_params_columns = [
      {
        title: '参数名称',
        dataIndex: 'name',
        key: 'name',
        width: 140
      },
      {
        title: '示例',
        dataIndex: 'example',
        key: 'example',
        width: 80,
        render(_, item) {
          return <p style={{ whiteSpace: 'pre-wrap' }}>{item.example}</p>;
        }
      },
      {
        title: '备注',
        dataIndex: 'desc',
        key: 'desc',
        render(_, item) {
          return <p style={{ whiteSpace: 'pre-wrap' }}>{item.desc}</p>;
        }
      }
    ];

    const columns = [
      {
        title: '参数名称',
        dataIndex: 'name',
        key: 'name',
        width: '200px'
      },
      {
        title: '参数值',
        dataIndex: 'value',
        key: 'value',
        width: '300px'
      },
      {
        title: '是否必须',
        dataIndex: 'required',
        key: 'required',
        width: '100px'
      },
      {
        title: '示例',
        dataIndex: 'example',
        key: 'example',
        width: '80px',
        render(_, item) {
          return <p style={{ whiteSpace: 'pre-wrap' }}>{item.example}</p>;
        }
      },
      {
        title: '备注',
        dataIndex: 'desc',
        key: 'desc',
        render(_, item) {
          return <p style={{ whiteSpace: 'pre-wrap' }}>{item.desc}</p>;
        }
      }
    ];

    let bodyShow =
      this.state.curData.req_body_other ||
      (this.state.curData.req_body_type === 'form' &&
        this.state.curData.req_body_form &&
        this.state.curData.req_body_form.length);

    let requestShow =
      (dataSource && dataSource.length) ||
      (req_dataSource && req_dataSource.length) ||
      (this.state.curData.req_query && this.state.curData.req_query.length) ||
      bodyShow;

    let methodColor =
      variable.METHOD_COLOR[
        this.state.curData.method ? this.state.curData.method.toLowerCase() : 'get'
      ];

    // statusColor = statusColor[this.state.curData.status?this.state.curData.status.toLowerCase():"undone"];
    // const aceEditor = <div style={{ display: this.state.curData.req_body_other && (this.state.curData.req_body_type !== "form") ? "block" : "none" }} className="colBody">
    //   <AceEditor data={this.state.curData.req_body_other} readOnly={true} style={{ minHeight: 300 }} mode={this.state.curData.req_body_type === 'json' ? 'javascript' : 'text'} />
    // </div>
    if (!methodColor) {
      methodColor = 'get';
    }


    let res = (
      <div className="caseContainer">
        <h2 className="interface-title" style={{ marginTop: 0 }}>
          基本信息
        </h2>
        <div className="panel-view">
          <Row className="row">
            <Col span={4} className="colKey">
              接口名称：
            </Col>
            <Col span={8} className="colName">
              {this.state.curData.title}
            </Col>
            <Col span={4} className="colKey">
              接口路径：
            </Col>
            <Col
              span={8}
              className="colValue"
              onMouseEnter={this.enterItem}
              onMouseLeave={this.leaveItem}
            >
              <span
                style={{ color: methodColor.color, backgroundColor: methodColor.bac }}
                className="colValue tag-method"
              >
                {this.state.curData.method}
              </span>
              <span className="colValue">
                {/* {this.state.currProject.basepath} */}
                {this.state.curData.path}
              </span>
            </Col>
          </Row>
          {/* <Row className="row">
            <Col span={4} className="colKey">
              Mock地址：
            </Col>
            <Col span={18} className="colValue">
              <span
                className="href"
                onClick={() =>
                  window.open(
                    location.protocol +
                      '//' +
                      location.hostname +
                      (location.port !== '' ? ':' + location.port : '') +
                      `/mock/${this.props.currProject._id}${this.props.currProject.basepath}${
                        this.state.curData.path
                      }`,
                    '_blank'
                  )
                }
              >
                {location.protocol +
                  '//' +
                  location.hostname +
                  (location.port !== '' ? ':' + location.port : '') +
                  `/mock/${this.props.currProject._id}${this.props.currProject.basepath}${
                    this.state.curData.path
                  }`}
              </span>
            </Col>
          </Row> */}
          {
            <Row className="row remark">
              <Col span={4} className="colKey">
              </Col>
              <Col span={18} className="colValue">
                {this.state.curData.custom_field_value}
              </Col>
            </Row>
          }
        </div>
        <h2 className="interface-title" style={{ display: requestShow ? '' : 'none' }}>
          请求参数
        </h2>
        {req_dataSource.length ? (
          <div className="colHeader">
            <h3 className="col-title">路径参数：</h3>
            <Table
              bordered
              size="small"
              pagination={false}
              columns={req_params_columns}
              dataSource={req_dataSource}
            />
          </div>
        ) : (
          ''
        )}
        {dataSource.length ? (
          <div className="colHeader">
            <h3 className="col-title">Headers：</h3>
            <Table
              bordered
              size="small"
              pagination={false}
              columns={columns}
              dataSource={dataSource}
            />
          </div>
        ) : (
          ''
        )}
        {this.state.curData.req_query && this.state.curData.req_query.length ? (
          <div className="colQuery">
            <h3 className="col-title">Query：</h3>
            {this.req_query(this.state.curData.req_query)}
          </div>
        ) : (
          ''
        )}

        <div
          style={{
            display:
              this.state.curData.method &&
              HTTP_METHOD[this.state.curData.method.toUpperCase()].request_body
                ? ''
                : 'none'
          }}
        >
          <h3 style={{ display: bodyShow ? '' : 'none' }} className="col-title">
            Body:
          </h3>
          {this.state.curData.req_body_type === 'form'
            ? this.req_body_form(this.state.curData.req_body_type, this.state.curData.req_body_form)
            : this.req_body(
                this.state.curData.req_body_type,
                this.state.curData.req_body_other,
                this.state.curData.req_body_is_json_schema
              )}
        </div>

        <h2 className="interface-title">返回数据</h2>
        {this.res_body(
          this.state.curData.res_body_type,
          this.state.curData.res_body,
          this.state.curData.res_body_is_json_schema
        )}
        {this.state.curData.desc && <h2 className="interface-title">备注</h2>}
        {this.state.curData.desc && (
          <div
            style={{ margin: '0px', padding: '0px 20px', float: 'none' }}
            dangerouslySetInnerHTML={{ __html: this.state.curData.desc }}
          />
        )}
      </div>
    );
    return res;
  }
}

export default View;

