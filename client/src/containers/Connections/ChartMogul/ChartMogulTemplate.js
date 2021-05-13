import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Segment, Form, Button, Icon, Header, Label, Message, Container, Divider, Grid, Checkbox,
} from "semantic-ui-react";
import cookie from "react-cookies";
import _ from "lodash";

import { generateDashboard } from "../../../actions/connection";
import { API_HOST } from "../../../config/settings";

/*
  The Form used to configure the ChartMogul template
*/
function ChartMogulTemplate(props) {
  const {
    teamId, projectId, addError, onComplete,
  } = props;

  const [loading, setLoading] = useState(false);
  const [connection, setConnection] = useState({});
  const [errors, setErrors] = useState({});
  const [testError, setTestError] = useState(false);
  const [configuration, setConfiguration] = useState(null);
  const [selectedCharts, setSelectedCharts] = useState([]);

  useEffect(() => {
    _getTemplateConfig();
  }, []);

  const _onGenerateDashboard = () => {
    setErrors({});

    if (!connection.token) {
      setTimeout(() => {
        setErrors({ ...errors, token: "Please enter your ChartMogul account token" });
      }, 100);
      return;
    }

    if (!connection.key) {
      setTimeout(() => {
        setErrors({ ...errors, key: "Please enter your ChartMogul account API key" });
      }, 100);
      return;
    }

    const data = { ...connection, team_id: teamId, charts: selectedCharts };
    setLoading(true);
    setTestError(false);

    generateDashboard(projectId, data, "chartmogul")
      .then(() => {
        setTimeout(() => {
          onComplete();
        }, 2000);
      })
      .catch(() => {
        setTestError(true);
        setLoading(false);
      });
  };

  const _getTemplateConfig = () => {
    const url = `${API_HOST}/template/chartmogul`;
    const method = "GET";
    const headers = new Headers({
      accept: "application/json",
      authorization: `Bearer ${cookie.load("brewToken")}`,
    });

    return fetch(url, { method, headers })
      .then((response) => {
        if (!response.ok) {
          return Promise.reject(response.status);
        }

        return response.json();
      })
      .then((config) => {
        setConfiguration(config);
        if (config.Charts && config.Charts.length > 0) {
          const charts = [];
          config.Charts.forEach((chart) => {
            charts.push(chart.tid);
          });

          setSelectedCharts(charts);
        }
      })
      .catch(() => {});
  };

  const _onChangeSelectedCharts = (tid) => {
    const newCharts = [].concat(selectedCharts) || [];
    const isSelected = _.indexOf(selectedCharts, tid);

    if (isSelected === -1) {
      newCharts.push(tid);
    } else {
      newCharts.splice(isSelected, 1);
    }

    setSelectedCharts(newCharts);
  };

  const _onSelectAll = () => {
    if (configuration && configuration.Charts) {
      const newSelectedCharts = [];
      configuration.Charts.forEach((chart) => {
        newSelectedCharts.push(chart.tid);
      });
      setSelectedCharts(newSelectedCharts);
    }
  };

  const _onDeselectAll = () => {
    setSelectedCharts([]);
  };

  return (
    <div style={styles.container}>
      <Segment style={styles.mainSegment}>
        <Header as="h3" style={{ marginBottom: 20 }}>
          Configure the template
        </Header>

        <div style={styles.formStyle}>
          <Form>
            <Form.Field>
              <Message compact>
                <p>
                  {"You can get your account token and API key "}
                  <a href="https://app.chartmogul.com/#/admin/api" target="_blank" rel="noreferrer">
                    {"from your ChartMogul dashboard. "}
                    <Icon name="external" />
                  </a>
                </p>
              </Message>
            </Form.Field>
            <Form.Field error={!!errors.token} required>
              <label>Enter your ChartMogul account token</label>
              <Form.Input
                value={connection.token || ""}
                onChange={(e, data) => {
                  setConnection({ ...connection, token: data.value });
                }}
                placeholder="487cd43d3656609a32e92d1e7d17cd25"
              />
              {errors.token
                && (
                  <Label basic color="red" pointing>
                    {errors.token}
                  </Label>
                )}
            </Form.Field>

            <Form.Field error={!!errors.key} required>
              <label>
                {"Enter your ChartMogul secret key "}
              </label>
              <Form.Input
                value={connection.key || ""}
                onChange={(e, data) => {
                  setConnection({ ...connection, key: data.value });
                }}
                placeholder="de2bf2bc6de5266d11ea6b918b674780"
              />
              {errors.key
                && (
                  <Label basic color="red" pointing>
                    {errors.key}
                  </Label>
                )}
            </Form.Field>

            {testError && (
              <Form.Field>
                <Message negative>
                  <Message.Header>{"Cannot make the connection"}</Message.Header>
                  <div>
                    <p>{"Please make sure you copied the right token and API key from your ChartMogul dashboard."}</p>
                    <p>
                      <a href="https://app.chartmogul.com/#/admin/api" target="_blank" rel="noreferrer">
                        {"Click here to go to the dashboard "}
                        <Icon name="external" />
                      </a>
                    </p>
                  </div>
                </Message>
              </Form.Field>
            )}
          </Form>

          {configuration && (
            <>
              <Divider hidden />
              <Header size="small">{"Select which charts you want Chartbrew to create for you"}</Header>
              <Grid columns={2} stackable>
                {configuration.Charts && configuration.Charts.map((chart) => (
                  <Grid.Column key={chart.tid}>
                    <Checkbox
                      label={chart.name}
                      checked={
                        _.indexOf(selectedCharts, chart.tid) > -1
                      }
                      onClick={() => _onChangeSelectedCharts(chart.tid)}
                    />
                  </Grid.Column>
                ))}
              </Grid>

              <Divider hidden />
              <Button
                icon="check"
                content="Select all"
                basic
                onClick={_onSelectAll}
                size="small"
              />
              <Button
                icon="x"
                content="Deselect all"
                basic
                onClick={_onDeselectAll}
                size="small"
              />
            </>
          )}
        </div>

        {addError
          && (
            <Message negative>
              <Message.Header>{"Server error while trying to save your connection"}</Message.Header>
              <p>Please try adding your connection again.</p>
            </Message>
          )}

        <Divider hidden />
        <Container fluid>
          <Button
            primary
            loading={loading}
            onClick={_onGenerateDashboard}
            icon
            labelPosition="right"
            style={styles.saveBtn}
            disabled={!connection.token || !connection.key || selectedCharts.length === 0}
          >
            <Icon name="magic" />
            Create the charts
          </Button>
        </Container>
      </Segment>
    </div>
  );
}
const styles = {
  container: {
    flex: 1,
  },
  mainSegment: {
    padding: 20,
  },
  formStyle: {
    marginTop: 20,
    marginBottom: 20,
  },
  saveBtn: {
    marginRight: 0,
  },
};

ChartMogulTemplate.defaultProps = {
  addError: null,
};

ChartMogulTemplate.propTypes = {
  teamId: PropTypes.string.isRequired,
  projectId: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
  addError: PropTypes.bool,
};

export default ChartMogulTemplate;
