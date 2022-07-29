/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from 'ethers';
import type { FunctionFragment, Result, EventFragment } from '@ethersproject/abi';
import type { Listener, Provider } from '@ethersproject/providers';
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from '../common';

export interface MockKlerosArbitratorInterface extends utils.Interface {
  functions: {
    'appeal(uint256,bytes)': FunctionFragment;
    'appealCost(uint256,bytes)': FunctionFragment;
    'appealPeriod(uint256)': FunctionFragment;
    'arbitrationCost(bytes)': FunctionFragment;
    'createDispute(uint256,bytes)': FunctionFragment;
    'currentRuling(uint256)': FunctionFragment;
    'disputeStatus(uint256)': FunctionFragment;
    'disputes(uint256)': FunctionFragment;
    'executeRuling(uint256)': FunctionFragment;
    'giveRuling(uint256,uint256)': FunctionFragment;
    'owner()': FunctionFragment;
    'setArbitrationCost(uint256)': FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | 'appeal'
      | 'appealCost'
      | 'appealPeriod'
      | 'arbitrationCost'
      | 'createDispute'
      | 'currentRuling'
      | 'disputeStatus'
      | 'disputes'
      | 'executeRuling'
      | 'giveRuling'
      | 'owner'
      | 'setArbitrationCost'
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: 'appeal',
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: 'appealCost',
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(functionFragment: 'appealPeriod', values: [PromiseOrValue<BigNumberish>]): string;
  encodeFunctionData(functionFragment: 'arbitrationCost', values: [PromiseOrValue<BytesLike>]): string;
  encodeFunctionData(
    functionFragment: 'createDispute',
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(functionFragment: 'currentRuling', values: [PromiseOrValue<BigNumberish>]): string;
  encodeFunctionData(functionFragment: 'disputeStatus', values: [PromiseOrValue<BigNumberish>]): string;
  encodeFunctionData(functionFragment: 'disputes', values: [PromiseOrValue<BigNumberish>]): string;
  encodeFunctionData(functionFragment: 'executeRuling', values: [PromiseOrValue<BigNumberish>]): string;
  encodeFunctionData(
    functionFragment: 'giveRuling',
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(functionFragment: 'owner', values?: undefined): string;
  encodeFunctionData(functionFragment: 'setArbitrationCost', values: [PromiseOrValue<BigNumberish>]): string;

  decodeFunctionResult(functionFragment: 'appeal', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'appealCost', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'appealPeriod', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'arbitrationCost', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'createDispute', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'currentRuling', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'disputeStatus', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'disputes', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'executeRuling', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'giveRuling', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'owner', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'setArbitrationCost', data: BytesLike): Result;

  events: {
    'AppealDecision(uint256,address)': EventFragment;
    'AppealPossible(uint256,address)': EventFragment;
    'DisputeCreation(uint256,address)': EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: 'AppealDecision'): EventFragment;
  getEvent(nameOrSignatureOrTopic: 'AppealPossible'): EventFragment;
  getEvent(nameOrSignatureOrTopic: 'DisputeCreation'): EventFragment;
}

export interface AppealDecisionEventObject {
  _disputeID: BigNumber;
  _arbitrable: string;
}
export type AppealDecisionEvent = TypedEvent<[BigNumber, string], AppealDecisionEventObject>;

export type AppealDecisionEventFilter = TypedEventFilter<AppealDecisionEvent>;

export interface AppealPossibleEventObject {
  _disputeID: BigNumber;
  _arbitrable: string;
}
export type AppealPossibleEvent = TypedEvent<[BigNumber, string], AppealPossibleEventObject>;

export type AppealPossibleEventFilter = TypedEventFilter<AppealPossibleEvent>;

export interface DisputeCreationEventObject {
  _disputeID: BigNumber;
  _arbitrable: string;
}
export type DisputeCreationEvent = TypedEvent<[BigNumber, string], DisputeCreationEventObject>;

export type DisputeCreationEventFilter = TypedEventFilter<DisputeCreationEvent>;

export interface MockKlerosArbitrator extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: MockKlerosArbitratorInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(eventFilter?: TypedEventFilter<TEvent>): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    appeal(
      _disputeID: PromiseOrValue<BigNumberish>,
      _extraData: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    appealCost(
      _disputeID: PromiseOrValue<BigNumberish>,
      _extraData: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    appealPeriod(
      _disputeID: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber, BigNumber] & { start: BigNumber; end: BigNumber }>;

    arbitrationCost(_extraData: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[BigNumber]>;

    createDispute(
      _choices: PromiseOrValue<BigNumberish>,
      _extraData: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    currentRuling(
      _disputeID: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { ruling: BigNumber }>;

    disputeStatus(
      _disputeID: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[number] & { status: number }>;

    disputes(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [string, BigNumber, BigNumber, number, BigNumber, BigNumber, BigNumber] & {
        arbitrated: string;
        choices: BigNumber;
        ruling: BigNumber;
        status: number;
        appealPeriodStart: BigNumber;
        appealPeriodEnd: BigNumber;
        appealCount: BigNumber;
      }
    >;

    executeRuling(
      _disputeID: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    giveRuling(
      _disputeID: PromiseOrValue<BigNumberish>,
      _ruling: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    setArbitrationCost(
      _newCost: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  appeal(
    _disputeID: PromiseOrValue<BigNumberish>,
    _extraData: PromiseOrValue<BytesLike>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  appealCost(
    _disputeID: PromiseOrValue<BigNumberish>,
    _extraData: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  appealPeriod(
    _disputeID: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<[BigNumber, BigNumber] & { start: BigNumber; end: BigNumber }>;

  arbitrationCost(_extraData: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;

  createDispute(
    _choices: PromiseOrValue<BigNumberish>,
    _extraData: PromiseOrValue<BytesLike>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  currentRuling(_disputeID: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;

  disputeStatus(_disputeID: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<number>;

  disputes(
    arg0: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<
    [string, BigNumber, BigNumber, number, BigNumber, BigNumber, BigNumber] & {
      arbitrated: string;
      choices: BigNumber;
      ruling: BigNumber;
      status: number;
      appealPeriodStart: BigNumber;
      appealPeriodEnd: BigNumber;
      appealCount: BigNumber;
    }
  >;

  executeRuling(
    _disputeID: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  giveRuling(
    _disputeID: PromiseOrValue<BigNumberish>,
    _ruling: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  owner(overrides?: CallOverrides): Promise<string>;

  setArbitrationCost(
    _newCost: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    appeal(
      _disputeID: PromiseOrValue<BigNumberish>,
      _extraData: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    appealCost(
      _disputeID: PromiseOrValue<BigNumberish>,
      _extraData: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    appealPeriod(
      _disputeID: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber, BigNumber] & { start: BigNumber; end: BigNumber }>;

    arbitrationCost(_extraData: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;

    createDispute(
      _choices: PromiseOrValue<BigNumberish>,
      _extraData: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    currentRuling(_disputeID: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;

    disputeStatus(_disputeID: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<number>;

    disputes(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [string, BigNumber, BigNumber, number, BigNumber, BigNumber, BigNumber] & {
        arbitrated: string;
        choices: BigNumber;
        ruling: BigNumber;
        status: number;
        appealPeriodStart: BigNumber;
        appealPeriodEnd: BigNumber;
        appealCount: BigNumber;
      }
    >;

    executeRuling(_disputeID: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;

    giveRuling(
      _disputeID: PromiseOrValue<BigNumberish>,
      _ruling: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    owner(overrides?: CallOverrides): Promise<string>;

    setArbitrationCost(_newCost: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
  };

  filters: {
    'AppealDecision(uint256,address)'(
      _disputeID?: PromiseOrValue<BigNumberish> | null,
      _arbitrable?: PromiseOrValue<string> | null
    ): AppealDecisionEventFilter;
    AppealDecision(
      _disputeID?: PromiseOrValue<BigNumberish> | null,
      _arbitrable?: PromiseOrValue<string> | null
    ): AppealDecisionEventFilter;

    'AppealPossible(uint256,address)'(
      _disputeID?: PromiseOrValue<BigNumberish> | null,
      _arbitrable?: PromiseOrValue<string> | null
    ): AppealPossibleEventFilter;
    AppealPossible(
      _disputeID?: PromiseOrValue<BigNumberish> | null,
      _arbitrable?: PromiseOrValue<string> | null
    ): AppealPossibleEventFilter;

    'DisputeCreation(uint256,address)'(
      _disputeID?: PromiseOrValue<BigNumberish> | null,
      _arbitrable?: PromiseOrValue<string> | null
    ): DisputeCreationEventFilter;
    DisputeCreation(
      _disputeID?: PromiseOrValue<BigNumberish> | null,
      _arbitrable?: PromiseOrValue<string> | null
    ): DisputeCreationEventFilter;
  };

  estimateGas: {
    appeal(
      _disputeID: PromiseOrValue<BigNumberish>,
      _extraData: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    appealCost(
      _disputeID: PromiseOrValue<BigNumberish>,
      _extraData: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    appealPeriod(_disputeID: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;

    arbitrationCost(_extraData: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;

    createDispute(
      _choices: PromiseOrValue<BigNumberish>,
      _extraData: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    currentRuling(_disputeID: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;

    disputeStatus(_disputeID: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;

    disputes(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;

    executeRuling(
      _disputeID: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    giveRuling(
      _disputeID: PromiseOrValue<BigNumberish>,
      _ruling: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    setArbitrationCost(
      _newCost: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    appeal(
      _disputeID: PromiseOrValue<BigNumberish>,
      _extraData: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    appealCost(
      _disputeID: PromiseOrValue<BigNumberish>,
      _extraData: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    appealPeriod(_disputeID: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;

    arbitrationCost(_extraData: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;

    createDispute(
      _choices: PromiseOrValue<BigNumberish>,
      _extraData: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    currentRuling(_disputeID: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;

    disputeStatus(_disputeID: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;

    disputes(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;

    executeRuling(
      _disputeID: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    giveRuling(
      _disputeID: PromiseOrValue<BigNumberish>,
      _ruling: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    setArbitrationCost(
      _newCost: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}