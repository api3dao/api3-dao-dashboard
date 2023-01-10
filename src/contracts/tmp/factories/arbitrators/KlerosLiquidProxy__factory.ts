/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, BytesLike, Overrides } from 'ethers';
import type { Provider, TransactionRequest } from '@ethersproject/providers';
import type { PromiseOrValue } from '../../common';
import type { KlerosLiquidProxy, KlerosLiquidProxyInterface } from '../../arbitrators/KlerosLiquidProxy';

const _abi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_claimsManager',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_klerosArbitrator',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: '_klerosArbitratorExtraData',
        type: 'bytes',
      },
      {
        internalType: 'string',
        name: '_metaEvidence',
        type: 'string',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'disputeId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'claimHash',
        type: 'bytes32',
      },
    ],
    name: 'AppealedKlerosArbitratorRuling',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'claimant',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'disputeId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'claimHash',
        type: 'bytes32',
      },
    ],
    name: 'CreatedDispute',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract IArbitrator',
        name: '_arbitrator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: '_disputeID',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_metaEvidenceID',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_evidenceGroupID',
        type: 'uint256',
      },
    ],
    name: 'Dispute',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract IArbitrator',
        name: '_arbitrator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: '_evidenceGroupID',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: '_party',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: '_evidence',
        type: 'string',
      },
    ],
    name: 'Evidence',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: '_metaEvidenceID',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: '_evidence',
        type: 'string',
      },
    ],
    name: 'MetaEvidence',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract IArbitrator',
        name: '_arbitrator',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: '_disputeID',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_ruling',
        type: 'uint256',
      },
    ],
    name: 'Ruling',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'disputeId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'evidence',
        type: 'string',
      },
    ],
    name: 'SubmittedEvidenceToKlerosArbitrator',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'disputeId',
        type: 'uint256',
      },
    ],
    name: 'appealCost',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'policyHash',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'claimant',
        type: 'address',
      },
      {
        internalType: 'uint224',
        name: 'claimAmountInUsd',
        type: 'uint224',
      },
      {
        internalType: 'string',
        name: 'evidence',
        type: 'string',
      },
    ],
    name: 'appealKlerosArbitratorRuling',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'disputeId',
        type: 'uint256',
      },
    ],
    name: 'appealPeriod',
    outputs: [
      {
        internalType: 'uint256',
        name: 'start',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'end',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'arbitrationCost',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'claimHashToDisputeIdPlusOne',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'claimsManager',
    outputs: [
      {
        internalType: 'contract IClaimsManager',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'subcourtID',
        type: 'uint256',
      },
    ],
    name: 'courts',
    outputs: [
      {
        internalType: 'uint96',
        name: 'parent',
        type: 'uint96',
      },
      {
        internalType: 'bool',
        name: 'hiddenVotes',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'minStake',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'alpha',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'feeForJuror',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'jurorsForCourtJump',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'policyHash',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'claimant',
        type: 'address',
      },
      {
        internalType: 'uint224',
        name: 'claimAmountInUsd',
        type: 'uint224',
      },
      {
        internalType: 'string',
        name: 'evidence',
        type: 'string',
      },
    ],
    name: 'createDispute',
    outputs: [
      {
        internalType: 'uint256',
        name: 'disputeId',
        type: 'uint256',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'disputeId',
        type: 'uint256',
      },
    ],
    name: 'currentRuling',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'disputeIdToClaimDetails',
    outputs: [
      {
        internalType: 'bytes32',
        name: 'policyHash',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'claimant',
        type: 'address',
      },
      {
        internalType: 'uint224',
        name: 'amountInUsd',
        type: 'uint224',
      },
      {
        internalType: 'string',
        name: 'evidence',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'disputeId',
        type: 'uint256',
      },
    ],
    name: 'disputeStatus',
    outputs: [
      {
        internalType: 'enum IArbitrator.DisputeStatus',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'disputeId',
        type: 'uint256',
      },
    ],
    name: 'disputes',
    outputs: [
      {
        internalType: 'uint96',
        name: 'subcourtID',
        type: 'uint96',
      },
      {
        internalType: 'address',
        name: 'arbitrated',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'numberOfChoices',
        type: 'uint256',
      },
      {
        internalType: 'uint8',
        name: 'period',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: 'lastPeriodChange',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'drawsInRound',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'commitsInRound',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'ruled',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'disputeId',
        type: 'uint256',
      },
    ],
    name: 'executeRuling',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint96',
        name: 'subcourtID',
        type: 'uint96',
      },
    ],
    name: 'getSubcourt',
    outputs: [
      {
        internalType: 'uint256[]',
        name: 'children',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256[4]',
        name: 'timesPerPeriod',
        type: 'uint256[4]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'klerosArbitrator',
    outputs: [
      {
        internalType: 'contract IArbitrator',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'klerosArbitratorExtraData',
    outputs: [
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes[]',
        name: 'data',
        type: 'bytes[]',
      },
    ],
    name: 'multicall',
    outputs: [
      {
        internalType: 'bytes[]',
        name: 'results',
        type: 'bytes[]',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'disputeId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'ruling',
        type: 'uint256',
      },
    ],
    name: 'rule',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'disputeId',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: 'evidence',
        type: 'string',
      },
    ],
    name: 'submitEvidenceToKlerosArbitrator',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

const _bytecode =
  '0x60c06040523480156200001157600080fd5b5060405162002a8b38038062002a8b83398101604081905262000034916200037e565b6001600160a01b038416620000905760405162461bcd60e51b815260206004820152601a60248201527f436c61696d734d616e616765722061646472657373207a65726f00000000000060448201526064015b60405180910390fd5b6001600160a01b038316620000e85760405162461bcd60e51b815260206004820152601d60248201527f4b6c65726f7341726269747261746f722061646472657373207a65726f000000604482015260640162000087565b8151620001385760405162461bcd60e51b815260206004820181905260248201527f4b6c65726f7341726269747261746f722065787472614461746120656d707479604482015260640162000087565b8051620001885760405162461bcd60e51b815260206004820152601360248201527f4d6574612065766964656e636520656d70747900000000000000000000000000604482015260640162000087565b6001600160a01b03808516608052831660a0528151620001b0906000906020850190620001f6565b5060007f61606860eb6c87306811e2695215385101daab53bd6ab4e9f9049aead9363c7d82604051620001e491906200043b565b60405180910390a250505050620004ad565b828054620002049062000470565b90600052602060002090601f01602090048101928262000228576000855562000273565b82601f106200024357805160ff191683800117855562000273565b8280016001018555821562000273579182015b828111156200027357825182559160200191906001019062000256565b506200028192915062000285565b5090565b5b8082111562000281576000815560010162000286565b80516001600160a01b0381168114620002b457600080fd5b919050565b634e487b7160e01b600052604160045260246000fd5b60005b83811015620002ec578181015183820152602001620002d2565b83811115620002fc576000848401525b50505050565b60006001600160401b03808411156200031f576200031f620002b9565b604051601f8501601f19908116603f011681019082821181831017156200034a576200034a620002b9565b816040528093508581528686860111156200036457600080fd5b62000374866020830187620002cf565b5050509392505050565b600080600080608085870312156200039557600080fd5b620003a0856200029c565b9350620003b0602086016200029c565b60408601519093506001600160401b0380821115620003ce57600080fd5b818701915087601f830112620003e357600080fd5b620003f48883516020850162000302565b935060608701519150808211156200040b57600080fd5b508501601f810187136200041e57600080fd5b6200042f8782516020840162000302565b91505092959194509250565b60208152600082518060208401526200045c816040850160208701620002cf565b601f01601f19169190910160400192915050565b600181811c908216806200048557607f821691505b60208210811415620004a757634e487b7160e01b600052602260045260246000fd5b50919050565b60805160a05161251e6200056d600039600081816103bf0152818161048f01528181610530015281816105be01528181610707015281816108c20152818161095f01528181610a3101528181610a8201528181610c9801528181610e2601528181610f800152818161100c015281816110fe015281816112e90152818161134201528181611574015281816116f1015261187001526000818161017f015281816107f601528181610d86015281816113ba0152611488015261251e6000f3fe6080604052600436106101045760003560e01c806359ec827e116100a05780638c5aa9c1116100645780638c5aa9c1146103ad5780638fd6c551146103e1578063a250bb28146103f4578063ac9650d814610414578063afe15cfb1461044157600080fd5b806359ec827e14610315578063697b05a2146103355780637d06356b1461034a57806382997b3c1461037a5780638bb048751461038d57600080fd5b806310f169e8146101095780631c3db16d1461013f5780631eb08ba91461016d5780631f5a0dd2146101ae5780632438b26a146102055780633052e3c314610227578063311a6c561461025457806340026c8714610276578063564a565d146102a4575b600080fd5b34801561011557600080fd5b50610129610124366004611ae3565b610476565b6040516101369190611b33565b60405180910390f35b34801561014b57600080fd5b5061015f61015a366004611ae3565b610517565b604051908152602001610136565b34801561017957600080fd5b506101a17f000000000000000000000000000000000000000000000000000000000000000081565b6040516101369190611b46565b3480156101ba57600080fd5b506101ce6101c9366004611ae3565b6105b3565b604080516001600160601b0390971687529415156020870152938501929092526060840152608083015260a082015260c001610136565b34801561021157600080fd5b5061021a61066e565b6040516101369190611bb6565b34801561023357600080fd5b5061015f610242366004611ae3565b60016020526000908152604090205481565b34801561026057600080fd5b5061027461026f366004611bc9565b6106fc565b005b34801561028257600080fd5b50610296610291366004611c00565b61089a565b604051610136929190611c1d565b3480156102b057600080fd5b506102c46102bf366004611ae3565b610951565b604080516001600160601b0390991689526001600160a01b0390971660208901529587019490945260ff9092166060860152608085015260a084015260c0830152151560e082015261010001610136565b34801561032157600080fd5b5061015f610330366004611ae3565b610a17565b34801561034157600080fd5b5061015f610a68565b34801561035657600080fd5b5061036a610365366004611ae3565b610b0c565b6040516101369493929190611c8b565b610274610388366004611d36565b610bd2565b34801561039957600080fd5b506102746103a8366004611ae3565b610ff6565b3480156103b957600080fd5b506101a17f000000000000000000000000000000000000000000000000000000000000000081565b61015f6103ef366004611d36565b61106c565b34801561040057600080fd5b5061027461040f366004611da8565b611433565b34801561042057600080fd5b5061043461042f366004611df3565b611759565b6040516101369190611e67565b34801561044d57600080fd5b5061046161045c366004611ae3565b61184d565b60408051928352602083019190915201610136565b60405163021e2d3d60e31b8152600481018290526000907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316906310f169e89060240160206040518083038186803b1580156104d957600080fd5b505afa1580156104ed573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105119190611ec9565b92915050565b604051631c3db16d60e01b8152600481018290526000907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031690631c3db16d906024015b60206040518083038186803b15801561057b57600080fd5b505afa15801561058f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105119190611eea565b6000806000806000807f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316631f5a0dd2886040518263ffffffff1660e01b815260040161060a91815260200190565b60c06040518083038186803b15801561062257600080fd5b505afa158015610636573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061065a9190611f18565b949c939b5091995097509550909350915050565b6000805461067b90611f72565b80601f01602080910402602001604051908101604052809291908181526020018280546106a790611f72565b80156106f45780601f106106c9576101008083540402835291602001916106f4565b820191906000526020600020905b8154815290600101906020018083116106d757829003601f168201915b505050505081565b336001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016146107735760405162461bcd60e51b815260206004820152601760248201527614d95b99195c881b9bdd0812db195c9bdcd31a5c5d5a59604a1b60448201526064015b60405180910390fd5b604051818152829033907f394027a5fa6e098a1191094d1719d6929b9abc535fcc0c8f448d6a4e756222769060200160405180910390a360008160028111156107be576107be611afc565b60008481526002602081905260409182902080546001820154928201549351633cac020b60e21b815294955090936001600160a01b037f000000000000000000000000000000000000000000000000000000000000000081169463f2b0082c9461084194939216916001600160e01b03909116906003880190899060040161204e565b602060405180830381600087803b15801561085b57600080fd5b505af115801561086f573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061089391906120a2565b5050505050565b60606108a4611a2c565b6040516340026c8760e01b81526001600160601b03841660048201527f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316906340026c879060240160006040518083038186803b15801561090c57600080fd5b505afa158015610920573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526109489190810190612172565b91509150915091565b6000806000806000806000807f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663564a565d8a6040518263ffffffff1660e01b81526004016109ab91815260200190565b6101006040518083038186803b1580156109c457600080fd5b505afa1580156109d8573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109fc919061222a565b97509750975097509750975097509750919395975091939597565b60405163791f8b7360e11b81526000906001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169063f23f16e69061056390859085906004016122b5565b60405163f7434ea960e01b81526000906001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169063f7434ea990610ab79084906004016122d6565b60206040518083038186803b158015610acf57600080fd5b505afa158015610ae3573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b079190611eea565b905090565b6002602081905260009182526040909120805460018201549282015460038301805492946001600160a01b0316936001600160e01b0390921692610b4f90611f72565b80601f0160208091040260200160405190810160405280929190818152602001828054610b7b90611f72565b8015610bc85780601f10610b9d57610100808354040283529160200191610bc8565b820191906000526020600020905b815481529060010190602001808311610bab57829003601f168201915b5050505050905084565b60008585858585604051602001610bed9594939291906122e9565b60408051601f1981840301815291815281516020928301206000818152600190935291205490915080610c625760405162461bcd60e51b815260206004820152601b60248201527f4e6f20646973707574652072656c6174656420746f20636c61696d0000000000604482015260640161076a565b6000610c6f60018361233e565b9050336001600160a01b0388161415610d6f57604051631c3db16d60e01b8152600481018290527f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031690631c3db16d9060240160206040518083038186803b158015610ce257600080fd5b505afa158015610cf6573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610d1a9190611eea565b60011415610d6a5760405162461bcd60e51b815260206004820152601b60248201527f52756c696e6720616772656573207769746820636c61696d616e740000000000604482015260640161076a565b610f3a565b6040516307e1b75d60e01b81526001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016906307e1b75d90610dbb903390600401611b46565b60206040518083038186803b158015610dd357600080fd5b505afa158015610de7573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e0b9190612355565b15610ef857604051631c3db16d60e01b8152600481018290527f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031690631c3db16d9060240160206040518083038186803b158015610e7057600080fd5b505afa158015610e84573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ea89190611eea565b60021415610d6a5760405162461bcd60e51b815260206004820152601e60248201527f52756c696e6720646973616772656573207769746820636c61696d616e740000604482015260640161076a565b60405162461bcd60e51b815260206004820152601760248201527613db9b1e481c185c9d1a595cc818d85b88185c1c19585b604a1b604482015260640161076a565b6040518390829033907ffd92e3a59e541cf08c773dbde767e9ecaf0d4bcbecbb74328fa8fbb3e26d884690600090a460405163093225f160e31b81526001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016906349912f88903490610fba9085906000906004016122b5565b6000604051808303818588803b158015610fd357600080fd5b505af1158015610fe7573d6000803e3d6000fd5b50505050505050505050505050565b604051638bb0487560e01b8152600481018290527f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031690638bb0487590602401600060405180830381600087803b15801561105857600080fd5b505af1158015610893573d6000803e3d6000fd5b6000336001600160a01b038616146110bc5760405162461bcd60e51b815260206004820152601360248201527214d95b99195c881b9bdd0818db185a5b585b9d606a1b604482015260640161076a565b600086338686866040516020016110d79594939291906122e9565b60408051808303601f1901815290829052805160209091012063c13517e160e01b825291507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03169063c13517e1903490611141906002906000906004016122b5565b6020604051808303818588803b15801561115a57600080fd5b505af115801561116e573d6000803e3d6000fd5b50505050506040513d601f19601f820116820180604052508101906111939190611eea565b91506040518060800160405280888152602001876001600160a01b03168152602001866001600160e01b0316815260200185858080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201829052509390945250508481526002602081815260409283902085518155858201516001820180546001600160a01b0319166001600160a01b039092169190911790559285015191830180546001600160e01b0319166001600160e01b0390931692909217909155606084015180519293506112779260038501929190910190611a4a565b5061128791508390506001612370565b600082815260016020526040808220929092559051829184916001600160a01b038a16917f0d87b829ff995bbb837214781e5fb4c4236ad3256c19b6e858dc2dde7369394a91a460408051600081526020810184905283916001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016917f74baab670a4015ab2f1b467c5252a96141a2573f2908e58a92081e80d3cfde3d910160405180910390a3856001600160a01b0316827f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03167fdccf2f8b2cc26eafcd61905cba744cff4b81d14740725f6376390dc6298a6a3c878760405161139b9291906123b1565b60405180910390a4604051638fd6c55160e01b81526001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001690638fd6c551906113f7908a908a908a908a908a906004016123c5565b600060405180830381600087803b15801561141157600080fd5b505af1158015611425573d6000803e3d6000fd5b505050505095945050505050565b806114715760405162461bcd60e51b815260206004820152600e60248201526d45766964656e636520656d70747960901b604482015260640161076a565b6040516307e1b75d60e01b81526001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016906307e1b75d906114bd903390600401611b46565b60206040518083038186803b1580156114d557600080fd5b505afa1580156114e9573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061150d9190612355565b6115515760405162461bcd60e51b815260206004820152601560248201527453656e6465722063616e6e6f74206d65646961746560581b604482015260640161076a565b60405163564a565d60e01b81526004810184905260009081906001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169063564a565d906024016101006040518083038186803b1580156115b757600080fd5b505afa1580156115cb573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906115ef919061222a565b50505050935050925050306001600160a01b0316826001600160a01b03161461164f5760405162461bcd60e51b8152602060048201526012602482015271125b9d985b1a5908191a5cdc1d5d1948125160721b604482015260640161076a565b60ff8116156116a05760405162461bcd60e51b815260206004820152601e60248201527f44697370757465206e6f7420696e2065766964656e636520706572696f640000604482015260640161076a565b84336001600160a01b03167f054ad4d8f465a0deff8a65ed55482e3b01a35438beeda4197b4f0d1993a3221386866040516116dc9291906123b1565b60405180910390a3336001600160a01b0316857f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03167fdccf2f8b2cc26eafcd61905cba744cff4b81d14740725f6376390dc6298a6a3c878760405161174a9291906123b1565b60405180910390a45050505050565b6060816001600160401b03811115611773576117736120bf565b6040519080825280602002602001820160405280156117a657816020015b60608152602001906001900390816117915790505b50905060005b8281101561184657611816308585848181106117ca576117ca61240a565b90506020028101906117dc9190612420565b8080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152506118f392505050565b8282815181106118285761182861240a565b6020026020010181905250808061183e90612466565b9150506117ac565b5092915050565b60405163afe15cfb60e01b81526004810182905260009081906001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169063afe15cfb90602401604080518083038186803b1580156118b157600080fd5b505afa1580156118c5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906118e99190612481565b9094909350915050565b606061191883836040518060600160405280602781526020016124c26027913961191f565b9392505050565b6060833b61197e5760405162461bcd60e51b815260206004820152602660248201527f416464726573733a2064656c65676174652063616c6c20746f206e6f6e2d636f6044820152651b9d1c9858dd60d21b606482015260840161076a565b600080856001600160a01b03168560405161199991906124a5565b600060405180830381855af49150503d80600081146119d4576040519150601f19603f3d011682016040523d82523d6000602084013e6119d9565b606091505b50915091506119e98282866119f3565b9695505050505050565b60608315611a02575081611918565b825115611a125782518084602001fd5b8160405162461bcd60e51b815260040161076a9190611bb6565b60405180608001604052806004906020820280368337509192915050565b828054611a5690611f72565b90600052602060002090601f016020900481019282611a785760008555611abe565b82601f10611a9157805160ff1916838001178555611abe565b82800160010185558215611abe579182015b82811115611abe578251825591602001919060010190611aa3565b50611aca929150611ace565b5090565b5b80821115611aca5760008155600101611acf565b600060208284031215611af557600080fd5b5035919050565b634e487b7160e01b600052602160045260246000fd5b60038110611b3057634e487b7160e01b600052602160045260246000fd5b50565b60208101611b4083611b12565b91905290565b6001600160a01b0391909116815260200190565b60005b83811015611b75578181015183820152602001611b5d565b83811115611b84576000848401525b50505050565b60008151808452611ba2816020860160208601611b5a565b601f01601f19169290920160200192915050565b6020815260006119186020830184611b8a565b60008060408385031215611bdc57600080fd5b50508035926020909101359150565b6001600160601b0381168114611b3057600080fd5b600060208284031215611c1257600080fd5b813561191881611beb565b60a0808252835190820181905260009060209060c0840190828701845b82811015611c5657815184529284019290840190600101611c3a565b5091935050508281018460005b6004811015611c8057815183529183019190830190600101611c63565b505050509392505050565b8481526001600160a01b03841660208201526001600160e01b03831660408201526080606082018190526000906119e990830184611b8a565b6001600160a01b0381168114611b3057600080fd5b6001600160e01b0381168114611b3057600080fd5b60008083601f840112611d0057600080fd5b5081356001600160401b03811115611d1757600080fd5b602083019150836020828501011115611d2f57600080fd5b9250929050565b600080600080600060808688031215611d4e57600080fd5b853594506020860135611d6081611cc4565b93506040860135611d7081611cd9565b925060608601356001600160401b03811115611d8b57600080fd5b611d9788828901611cee565b969995985093965092949392505050565b600080600060408486031215611dbd57600080fd5b8335925060208401356001600160401b03811115611dda57600080fd5b611de686828701611cee565b9497909650939450505050565b60008060208385031215611e0657600080fd5b82356001600160401b0380821115611e1d57600080fd5b818501915085601f830112611e3157600080fd5b813581811115611e4057600080fd5b8660208260051b8501011115611e5557600080fd5b60209290920196919550909350505050565b6000602080830181845280855180835260408601915060408160051b870101925083870160005b82811015611ebc57603f19888603018452611eaa858351611b8a565b94509285019290850190600101611e8e565b5092979650505050505050565b600060208284031215611edb57600080fd5b81516003811061191857600080fd5b600060208284031215611efc57600080fd5b5051919050565b80518015158114611f1357600080fd5b919050565b60008060008060008060c08789031215611f3157600080fd5b8651611f3c81611beb565b9550611f4a60208801611f03565b945060408701519350606087015192506080870151915060a087015190509295509295509295565b600181811c90821680611f8657607f821691505b60208210811415611fa757634e487b7160e01b600052602260045260246000fd5b50919050565b8054600090600181811c9080831680611fc757607f831692505b6020808410821415611fe957634e487b7160e01b600052602260045260246000fd5b838852818015612000576001811461201457612042565b60ff19861689830152604089019650612042565b876000528160002060005b8681101561203a5781548b820185015290850190830161201f565b8a0183019750505b50505050505092915050565b8581526001600160a01b03851660208201526001600160e01b038416604082015260a06060820181905260009061208790830185611fad565b905061209283611b12565b8260808301529695505050505050565b6000602082840312156120b457600080fd5b815161191881611cd9565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f191681016001600160401b03811182821017156120fd576120fd6120bf565b604052919050565b600082601f83011261211657600080fd5b604051608081018181106001600160401b0382111715612138576121386120bf565b60405280608084018581111561214d57600080fd5b845b8181101561216757805183526020928301920161214f565b509195945050505050565b60008060a0838503121561218557600080fd5b82516001600160401b038082111561219c57600080fd5b818501915085601f8301126121b057600080fd5b81516020828211156121c4576121c46120bf565b8160051b92506121d58184016120d5565b82815292840181019281810190898511156121ef57600080fd5b948201945b8486101561220d578551825294820194908201906121f4565b965061221d905088888301612105565b9450505050509250929050565b600080600080600080600080610100898b03121561224757600080fd5b885161225281611beb565b60208a015190985061226381611cc4565b60408a015160608b0151919850965060ff8116811461228157600080fd5b809550506080890151935060a0890151925060c089015191506122a660e08a01611f03565b90509295985092959890939650565b8281526040602082015260006122ce6040830184611fad565b949350505050565b6020815260006119186020830184611fad565b8581526001600160601b03198560601b16602082015263ffffffff198460201b1660348201528183605083013760009101605001908152949350505050565b634e487b7160e01b600052601160045260246000fd5b60008282101561235057612350612328565b500390565b60006020828403121561236757600080fd5b61191882611f03565b6000821982111561238357612383612328565b500190565b81835281816020850137506000828201602090810191909152601f909101601f19169091010190565b6020815260006122ce602083018486612388565b8581526001600160a01b03851660208201526001600160e01b03841660408201526080606082018190526000906123ff9083018486612388565b979650505050505050565b634e487b7160e01b600052603260045260246000fd5b6000808335601e1984360301811261243757600080fd5b8301803591506001600160401b0382111561245157600080fd5b602001915036819003821315611d2f57600080fd5b600060001982141561247a5761247a612328565b5060010190565b6000806040838503121561249457600080fd5b505080516020909101519092909150565b600082516124b7818460208701611b5a565b919091019291505056fe416464726573733a206c6f772d6c6576656c2064656c65676174652063616c6c206661696c6564a264697066735822122002d84fdd556b9f854392c67166e1fe825971df185b8709fb5352ef694cfac26a64736f6c63430008090033';

type KlerosLiquidProxyConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (xs: KlerosLiquidProxyConstructorParams): xs is ConstructorParameters<typeof ContractFactory> =>
  xs.length > 1;

export class KlerosLiquidProxy__factory extends ContractFactory {
  constructor(...args: KlerosLiquidProxyConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _claimsManager: PromiseOrValue<string>,
    _klerosArbitrator: PromiseOrValue<string>,
    _klerosArbitratorExtraData: PromiseOrValue<BytesLike>,
    _metaEvidence: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<KlerosLiquidProxy> {
    return super.deploy(
      _claimsManager,
      _klerosArbitrator,
      _klerosArbitratorExtraData,
      _metaEvidence,
      overrides || {}
    ) as Promise<KlerosLiquidProxy>;
  }
  override getDeployTransaction(
    _claimsManager: PromiseOrValue<string>,
    _klerosArbitrator: PromiseOrValue<string>,
    _klerosArbitratorExtraData: PromiseOrValue<BytesLike>,
    _metaEvidence: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _claimsManager,
      _klerosArbitrator,
      _klerosArbitratorExtraData,
      _metaEvidence,
      overrides || {}
    );
  }
  override attach(address: string): KlerosLiquidProxy {
    return super.attach(address) as KlerosLiquidProxy;
  }
  override connect(signer: Signer): KlerosLiquidProxy__factory {
    return super.connect(signer) as KlerosLiquidProxy__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): KlerosLiquidProxyInterface {
    return new utils.Interface(_abi) as KlerosLiquidProxyInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): KlerosLiquidProxy {
    return new Contract(address, _abi, signerOrProvider) as KlerosLiquidProxy;
  }
}