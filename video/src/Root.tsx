import React from 'react';
import {Composition} from 'remotion';
import {Semanal, SemanalProps, duracaoTotal} from './Semanal';
import exemplo from '../exemplo.json';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Semanal"
    component={Semanal}
    fps={30}
    width={1080}
    height={1920}
    durationInFrames={300}
    defaultProps={exemplo as SemanalProps}
    calculateMetadata={({props}) => ({durationInFrames: duracaoTotal(props.cenas)})}
  />
);
