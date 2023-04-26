import React, { PureComponent } from 'react';
import { Row, Col, Layout } from 'antd';
import { connect } from 'react-redux';
import { getList } from '@redux/performer/actions';
import PerformerCard from '@components/performer/card';
import Head from 'next/head';
import { ProPagination } from '@components/pagination';
import { SearchFilter } from '@components/common/base/search-filter';
import { DropOption } from '@components/common/base/drop-option';
import { IUIConfig } from 'src/interfaces/';
import '@components/performer/performer.less';

interface IProps {
  getList: Function;
  performerState: any;
  ui: IUIConfig;
}

const { Content } = Layout;

class Performers extends PureComponent<IProps> {
  static authenticate: boolean = true;

  static noredirect: boolean = true;

  state = {
    offset: 0,
    limit: 12
  };

  componentDidMount() {
    const { getList: getListHandler } = this.props;
    const { limit, offset } = this.state;
    getListHandler({
      limit,
      offset,
      status: 'active'
    });
  }

  pageChanged = (page: number) => {
    const { getList: getListHandler } = this.props;
    const { limit } = this.state;
    // eslint-disable-next-line react/no-access-state-in-setstate
    this.setState({ ...this.state, offset: page });
    getListHandler({
      limit,
      offset: (page - 1) * 12,
      status: 'active'
    });
  };

  handleFilter(values: any) {
    const { getList: getListHandler } = this.props;
    const { limit } = this.state;
    // eslint-disable-next-line react/no-access-state-in-setstate
    this.setState({ ...this.state, offset: 0 });
    getListHandler({
      limit,
      offset: 0,
      ...values,
      status: 'active'
    });
  }

  handleSort(values: any) {
    const sort = {
      sort: values.key
    };
    const { getList: getListHandler } = this.props;
    const { limit } = this.state;
    // eslint-disable-next-line react/no-access-state-in-setstate
    this.setState({ ...this.state, offset: 0 });
    getListHandler({
      limit,
      offset: 0,
      ...sort,
      status: 'active'
    });
  }

  render() {
    const {
      performerState = {
        requesting: false,
        error: null,
        success: false,
        data: null
      },
      ui
    } = this.props;
    const { limit, offset } = this.state;
    const performers =
      performerState.data && performerState.data.data
        ? performerState.data.data
        : [];
    const total =
      performerState.data && performerState.data.total
        ? performerState.data.total
        : 0;
    const isLoading = performerState.requesting;

    return (
      <>
        <Head>
          <title>{ui && ui.siteName} | Models</title>
        </Head>
        <Layout>
          <Content>
            <div className="main-container">
              <div
                className="page-heading flex-row-space-between"
                style={{ position: 'relative' }}
              >
                {/* <span>Models ({total})</span> */}
                <span className="sort-model">
                  <DropOption
                    menuOptions={[
                      { key: 'latest', name: 'Latest' },
                      { key: 'oldest', name: 'Oldest' },
                      { key: 'popular', name: 'Popular' }
                    ]}
                    buttonStyle={{
                      height: '40px',
                      border: '1px solid #ccc',
                      padding: '5px 20px',
                      borderRadius: '5px'
                    }}
                    onMenuClick={this.handleSort.bind(this)}
                  />
                </span>
              </div>
              <SearchFilter
                genders={[
                  { key: '', text: 'All' },
                  { key: 'male', text: 'Male' },
                  { key: 'female', text: 'Female' },
                  { key: 'transgender', text: 'Transgender' }
                ]}
                onSubmit={this.handleFilter.bind(this)}
              />
              <div style={{ marginBottom: '20px' }} />
              <div className="main-background">
                <Row>
                  {performers.length > 0 &&
                    !isLoading &&
                    performers.map((p: any) => (
                      <Col xs={12} sm={12} md={6} lg={6} key={p._id}>
                        <PerformerCard performer={p} />
                      </Col>
                    ))}
                  {!total && !isLoading && <p>No model found.</p>}
                  {isLoading && <p>loading...</p>}
                  {total && total > limit && !isLoading ? (
                    <div className="paging">
                      <ProPagination
                        showQuickJumper
                        defaultCurrent={offset + 1}
                        total={total}
                        pageSize={limit}
                        onChange={this.pageChanged}
                      />
                    </div>
                  ) : null}
                </Row>
              </div>
            </div>
          </Content>
        </Layout>
      </>
    );
  }
}

const mapStates = (state: any) => ({
  performerState: { ...state.performer.performerListing },
  ui: { ...state.ui }
});

const mapDispatch = { getList };
export default connect(mapStates, mapDispatch)(Performers);
