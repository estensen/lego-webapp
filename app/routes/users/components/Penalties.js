// @flow

import React from 'react';
import { FormatTime } from 'app/components/Time';
import PenaltyForm from './PenaltyForm';
import { ConfirmModalWithParent } from 'app/components/Modal/ConfirmModal';
import type { AddPenalty } from 'app/models';

type Penalty = {
  id: number,
  reason: string,
  weight: number,
  exactExpiration: string
};

type Props = {
  penalties: Array<Penalty>,
  addPenalty: AddPenalty => void,
  deletePenalty: number => Promise<*>,
  username: string,
  userId: number,
  canDeletePenalties: boolean
};

function Penalties({
  penalties,
  addPenalty,
  deletePenalty,
  username,
  userId,
  canDeletePenalties
}: Props) {
  return (
    <div>
      {penalties.length ? (
        <ul>
          {penalties.map(penalty => {
            const word = penalty.weight > 1 ? 'prikker' : 'prikk';
            return (
              <li key={penalty.id} style={{ marginBottom: '10px' }}>
                <div>
                  <strong>
                    {penalty.weight} {word}
                  </strong>
                </div>
                <div>
                  Begrunnelse: <i>{penalty.reason}</i>
                </div>
                <div>
                  Utgår:{' '}
                  <i>
                    <FormatTime time={penalty.exactExpiration} />
                  </i>
                </div>
                {canDeletePenalties && (
                  <ConfirmModalWithParent
                    title="Slett prikk"
                    message="Er du sikker på at du vil slette denne prikken?"
                    onConfirm={() => deletePenalty(penalty.id)}
                  >
                    <a>Slett prikk </a>
                  </ConfirmModalWithParent>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <i>Ingen Prikker</i>
      )}
      <PenaltyForm user={userId} />
    </div>
  );
}

export default Penalties;
