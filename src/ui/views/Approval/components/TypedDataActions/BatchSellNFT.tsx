import React, { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import { Chain } from 'background/service/openapi';
import { Result } from '@rabby-wallet/rabby-security-engine';
import { ContractRequireData, TypedDataActionData } from './utils';
import { isSameAddress } from 'ui/utils';
import { formatAmount, formatUsdValue } from 'ui/utils/number';
import { useRabbyDispatch, useRabbySelector } from '@/ui/store';
import { Table, Col, Row } from '../Actions/components/Table';
import NFTWithName from '../Actions/components/NFTWithName';
import * as Values from '../Actions/components/Values';
import { SecurityListItem } from '../Actions/components/SecurityListItem';
import ViewMore from '../Actions/components/ViewMore';
import { ProtocolListItem } from '../Actions/components/ProtocolListItem';
import LogoWithText from '../Actions/components/LogoWithText';
import { ellipsisTokenSymbol, getTokenSymbol } from '@/ui/utils/token';
import SecurityLevelTagNoText from '../SecurityEngine/SecurityLevelTagNoText';
import { SubCol, SubRow, SubTable } from '../Actions/components/SubTable';

const Wrapper = styled.div`
  .header {
    margin-top: 15px;
  }
  .icon-edit-alias {
    width: 13px;
    height: 13px;
    cursor: pointer;
  }
  .icon-scam-token {
    margin-left: 4px;
    width: 13px;
  }
  .icon-fake-token {
    margin-left: 4px;
    width: 13px;
  }
  li .name-and-address {
    justify-content: flex-start;
    .address {
      font-weight: 400;
      font-size: 12px;
      line-height: 14px;
      color: #999999;
    }
    img {
      width: 12px !important;
      height: 12px !important;
      margin-left: 4px !important;
    }
  }
`;

const BatchSellNFT = ({
  data,
  requireData,
  chain,
  engineResults,
  sender,
}: {
  data: TypedDataActionData['batchSellNFT'];
  requireData: ContractRequireData;
  chain: Chain;
  engineResults: Result[];
  sender: string;
}) => {
  const actionData = data!;
  const dispatch = useRabbyDispatch();
  const { t } = useTranslation();
  const { rules, processedRules, contractWhitelist } = useRabbySelector(
    (s) => ({
      rules: s.securityEngine.rules,
      processedRules: s.securityEngine.currentTx.processedRules,
      contractWhitelist: s.securityEngine.userData.contractWhitelist,
    })
  );

  const isInWhitelist = useMemo(() => {
    return contractWhitelist.some(
      (item) =>
        item.chainId === chain.serverId &&
        isSameAddress(item.address, requireData.id)
    );
  }, [contractWhitelist, requireData]);

  const engineResultMap = useMemo(() => {
    const map: Record<string, Result> = {};
    engineResults.forEach((item) => {
      map[item.id] = item;
    });
    return map;
  }, [engineResults]);

  const hasReceiver = useMemo(() => {
    return !isSameAddress(actionData.receiver, sender);
  }, [actionData, sender]);

  const handleClickRule = (id: string) => {
    const rule = rules.find((item) => item.id === id);
    if (!rule) return;
    const result = engineResultMap[id];
    dispatch.securityEngine.openRuleDrawer({
      ruleConfig: rule,
      value: result?.value,
      level: result?.level,
      ignored: processedRules.includes(id),
    });
  };

  return (
    <Wrapper>
      <Table>
        <Col>
          <Row isTitle>{t('page.signTypedData.sellNFT.listNFT')}</Row>
          <Row className="gap-y-6 flex flex-col overflow-hidden items-end">
            {actionData.pay_nft_list.map((nft) => (
              <ViewMore
                key={nft.id}
                type="nft"
                data={{
                  nft,
                  chain,
                }}
              >
                <NFTWithName hasHover nft={nft}></NFTWithName>
              </ViewMore>
            ))}
          </Row>
        </Col>
        <Col>
          <Row isTitle>{t('page.signTypedData.sellNFT.receiveToken')}</Row>
          <Row>
            <LogoWithText
              className="overflow-hidden"
              logo={actionData.receive_token.logo_url}
              text={
                <div className="overflow-hidden overflow-ellipsis flex">
                  <Values.TokenAmount value={actionData.receive_token.amount} />
                  <span className="ml-2">
                    <Values.TokenSymbol token={actionData.receive_token} />
                  </span>
                </div>
              }
              logoRadius="100%"
              icon={
                <Values.TokenLabel
                  isFake={actionData.receive_token.is_verified === false}
                  isScam={
                    actionData.receive_token.is_verified !== false &&
                    !!actionData.receive_token.is_suspicious
                  }
                />
              }
            />
            {engineResultMap['1116'] && (
              <SecurityLevelTagNoText
                enable={engineResultMap['1116'].enable}
                level={
                  processedRules.includes('1116')
                    ? 'proceed'
                    : engineResultMap['1116'].level
                }
                onClick={() => handleClickRule('1116')}
              />
            )}
            {engineResultMap['1117'] && (
              <SecurityLevelTagNoText
                enable={engineResultMap['1117'].enable}
                level={
                  processedRules.includes('1117')
                    ? 'proceed'
                    : engineResultMap['1117'].level
                }
                onClick={() => handleClickRule('1117')}
              />
            )}
          </Row>
        </Col>
        <Col>
          <Row isTitle>{t('page.signTypedData.buyNFT.expireTime')}</Row>
          <Row>
            {actionData.expire_at ? (
              <Values.TimeSpanFuture to={Number(actionData.expire_at)} />
            ) : (
              '-'
            )}
          </Row>
        </Col>
        {actionData.takers.length > 0 && (
          <Col>
            <Row isTitle>{t('page.signTypedData.sellNFT.specificBuyer')}</Row>
            <Row>
              <Values.Address address={actionData.takers[0]} chain={chain} />
              {engineResultMap['1114'] && (
                <SecurityLevelTagNoText
                  enable={engineResultMap['1114'].enable}
                  level={
                    processedRules.includes('1114')
                      ? 'proceed'
                      : engineResultMap['1114'].level
                  }
                  onClick={() => handleClickRule('1114')}
                />
              )}
            </Row>
          </Col>
        )}
        {hasReceiver && (
          <>
            <Col>
              <Row isTitle>{t('page.signTx.swap.receiver')}</Row>
              <Row>
                <Values.Address
                  id="batch-sell-nft-receiver"
                  address={actionData.receiver}
                  chain={chain}
                />
              </Row>
            </Col>
            <SubTable target="batch-sell-nft-receiver">
              <SecurityListItem
                id="1115"
                engineResult={engineResultMap['1115']}
                dangerText={t('page.signTx.swap.notPaymentAddress')}
              />
            </SubTable>
          </>
        )}
        <Col>
          <Row isTitle>{t('page.signTypedData.buyNFT.listOn')}</Row>
          <Row>
            <ViewMore
              type="contract"
              data={{
                ...requireData,
                address: requireData.id,
                chain,
                title: t('page.signTypedData.buyNFT.listOn'),
              }}
            >
              <Values.Address
                id="batch-sell-nft-address"
                hasHover
                address={requireData.id}
                chain={chain}
              />
            </ViewMore>
          </Row>
        </Col>
        <SubTable target="batch-sell-nft-address">
          <SubCol>
            <SubRow isTitle>{t('page.signTx.protocol')}</SubRow>
            <SubRow>
              <ProtocolListItem protocol={requireData.protocol} />
            </SubRow>
          </SubCol>

          {isInWhitelist && (
            <SubCol>
              <SubRow isTitle>{t('page.signTx.myMark')}</SubRow>
              <SubRow>{t('page.signTx.trusted')}</SubRow>
            </SubCol>
          )}
          <SecurityListItem
            id="1135"
            engineResult={engineResultMap['1135']}
            forbiddenText={t('page.signTx.markAsBlock')}
            title={t('page.signTx.myMark')}
          />

          <SecurityListItem
            id="1137"
            engineResult={engineResultMap['1137']}
            warningText={t('page.signTx.markAsBlock')}
            title={t('page.signTx.myMark')}
          />
        </SubTable>
      </Table>
    </Wrapper>
  );
};

export default BatchSellNFT;
