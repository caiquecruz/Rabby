import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode.react';
import { UR, UREncoder } from '@ngraveio/bc-ur';
import { useTranslation, Trans } from 'react-i18next';
import { Button } from 'antd';
import clsx from 'clsx';
import { WALLET_BRAND_TYPES } from '@/constant';

interface IProps {
  type: string;
  cbor: string;
  onSign: () => void;
  brandName: string;
  playerSize?: number;
  layoutStyle?: 'compact' | 'normal';
}

const Player = ({
  type,
  cbor,
  onSign,
  brandName,
  playerSize,
  layoutStyle = 'compact',
}: IProps) => {
  const [interval, setIntervalValue] = useState(100);
  const [maxFragmentLength, setMaxFragmentLength] = useState(200);
  const [qrSize, setQRSize] = useState(playerSize ?? 180);
  const [level, setLevel] = useState('L');

  const urEncoder = useMemo(
    // For NGRAVE ZERO support please keep to a maximum fragment size of 200
    () =>
      new UREncoder(new UR(Buffer.from(cbor, 'hex'), type), maxFragmentLength),
    [cbor, type, maxFragmentLength]
  );
  const [currentQRCode, setCurrentQRCode] = useState(urEncoder.nextPart());
  const { t } = useTranslation();

  const handleLevelChange = (event) => {
    setLevel(event.target.value);
  };

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentQRCode(urEncoder.nextPart());
    }, interval);
    return () => {
      clearInterval(id);
    };
  }, [urEncoder, interval, level]);

  if (brandName == WALLET_BRAND_TYPES.NGRAVEZERO) {
    brandName = 'NGRAVE ZERO';
  }

  return (
    <div className="flex flex-col items-center" style={{ height: '100%' }}>
      <div className="p-[5px] border border-gray-divider rounded-[8px] bg-white">
        <QRCode
          value={currentQRCode.toUpperCase()}
          size={qrSize}
          level={level}
        />
      </div>
      <p
        className={clsx(
          layoutStyle === 'normal' ? 'mt-20' : 'mt-6',
          'text-13 leading-[18px] mb-0 text-r-neutral-body font-medium text-center whitespace-nowrap'
        )}
      >
        <Trans
          i18nKey="page.signFooterBar.qrcode.qrcodeDesc"
          values={{
            brand: brandName,
          }}
        ></Trans>
      </p>

      <div
        style={{
          paddingBottom: '16px',
          paddingLeft: '16px',
          paddingRight: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          QR Code Interval ({interval} ms)
        </div>
        <input
          type="range"
          min="10"
          max="1000"
          step="10"
          value={interval}
          onChange={(e) => setIntervalValue(Number(e.target.value))}
        />
        <div style={{ textAlign: 'center' }}>
          Max Fragment Length {maxFragmentLength}
        </div>
        <input
          type="range"
          min="10"
          max="1500"
          step="1"
          value={maxFragmentLength}
          onChange={(e) => setMaxFragmentLength(Number(e.target.value))}
        />
        <div style={{ textAlign: 'center' }}>QR Code Size {qrSize}</div>
        <input
          type="range"
          min="10"
          max="500"
          step="1"
          value={qrSize}
          onChange={(e) => setQRSize(Number(e.target.value))}
        />
        <div
          style={{
            paddingTop: '16px',
            paddingBottom: '16px',
            paddingLeft: '16px',
            paddingRight: '16px',
          }}
        >
          <div style={{ textAlign: 'center' }}>Error Correction Level</div>
          <>
            <input
              type="radio"
              id="levelL"
              name="level"
              value="L"
              checked={level === 'L'}
              onChange={handleLevelChange}
            />
            <label htmlFor="levelL">Low (L)</label>
            <br />
            <input
              type="radio"
              id="levelM"
              name="level"
              value="M"
              checked={level === 'M'}
              onChange={handleLevelChange}
            />
            <label htmlFor="levelM">Medium (M)</label>
            <br />
            <input
              type="radio"
              id="levelQ"
              name="level"
              value="Q"
              checked={level === 'Q'}
              onChange={handleLevelChange}
            />
            <label htmlFor="levelQ">Quartile (Q)</label>
            <br />
            <input
              type="radio"
              id="levelH"
              name="level"
              value="H"
              checked={level === 'H'}
              onChange={handleLevelChange}
            />
            <label htmlFor="levelH">High (H)</label>
          </>
        </div>
      </div>

      <Button
        onClick={onSign}
        className={clsx(
          'w-[180px] h-[40px]',
          'active:before:bg-[#00000033]',
          layoutStyle === 'normal' ? 'mt-20' : 'mt-6'
        )}
        type="primary"
      >
        {t('page.signFooterBar.qrcode.getSig')}
      </Button>
    </div>
  );
};
export default Player;
