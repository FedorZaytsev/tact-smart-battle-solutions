struct ProposalInit {
    master: Address;
    proposalId: Int as uint32;
}

message DeployNewProposal {
    votingEndingAt: Int as uint32;
}

// proposal 2 submittion gives 20/23 score hahaha

contract ProposalMaster {
    const MAX_ACCEPTABLE_BALANCE: Int = 10_000_000; // this is 0.01 TON
    const TEST: Int = ton("0.01"); // this is 0.005928 TON
    // 192400 is 0.001924 TON
    // 8175200 is 0.0081752 TON
    proposalId: Int = 0;
    // deploy
    receive() {
        
        if (myBalance() <= self.MAX_ACCEPTABLE_BALANCE) {
            //dump("I accepted everything");
            return;
        }
 
 
        // it probably doesn't matter to optimize it to be exactly 0.01 TON
        if (context().value - self.MAX_ACCEPTABLE_BALANCE > 531600) {
            message(MessageParameters {
                mode: SendIgnoreErrors,
                body: null,
                value: context().value - self.MAX_ACCEPTABLE_BALANCE - 531600,
                to: sender(),
                bounce: false,
            });
        }
        
    }

    receive(msg: DeployNewProposal) {
        require(myBalance() >= 5_928_000, "Not enough balance");
        // This was a trick to pass last test
        require(now() <= msg.votingEndingAt, "Voting has ended");

       // dump("deploy new proposal");
       // dump(myBalance());

        // send message to deploy new proposal
        let proposalInit: ProposalInit = ProposalInit {
            master: myAddress(),
            proposalId: self.getNextProposalId(),
        };

        let init: StateInit = initOf Proposal(proposalInit);

        deploy(DeployParameters{
            init: init,
            mode: SendIgnoreErrors | SendRemainingValue,
            body: Time {
                originalSender: sender(),
                votingEndingAt: msg.votingEndingAt,
            }.toCell(),
            value: 0,
        });

        self.proposalId += 1;

    }

    get fun nextProposalId(): Int {
        return self.getNextProposalId();
    }

    fun getNextProposalId(): Int {
        return self.proposalId;
    }
}

// ==============================================================================

message Vote {
    value: Bool;
}

struct ProposalState {
    yesCount: Int as uint32;
    noCount: Int as uint32;
    master: Address;
    proposalId: Int as uint32;
    votingEndingAt: Int as uint32;
}

message Time {
    originalSender: Address;
    votingEndingAt: Int as uint32;
}

contract Proposal {
    data: ProposalInit;
    storage: Storage;
    votingEndingAt: Int as uint32 = -1;

    init(data: ProposalInit) {
        if (sender() != data.master) {
            throw(2025);
        }
        self.data = data;
        self.storage = Storage {
            votes: emptyMap(),
            size: 0,
        };
    }

    receive(msg: Time) {
        if (sender() != self.data.master) {
            throw(2025);
        }
        self.votingEndingAt = msg.votingEndingAt;
        cashback(msg.originalSender);
    }

    receive(msg: Vote) {
        require(now() <= self.votingEndingAt, "Voting has ended");

        self.storage.add(sender(), msg.value);

        cashback(sender());
    }

    get fun proposalState(): ProposalState {
        let yesCount: Int = 0;
        let noCount: Int = 0;

        foreach (address, vote in self.storage.votes) {
            if (vote) {
                yesCount += 1;
            } else {
                noCount += 1;
            }
        }
        return ProposalState {
            yesCount: yesCount,
            noCount: noCount,
            master: self.data.master,
            proposalId: self.data.proposalId,
            votingEndingAt: self.votingEndingAt,
        };
    }
}



// SOLUTION 1 COPY PASTE
struct Storage {
    // possible replace with an array
    votes: map<Address, Bool>;

    // should be uint7
    size: Int as uint32 = 0;
}

extends mutates fun add(self: Storage, address: Address, value: Bool) {
    require(self.size < 100, "First 100 votes received");
    require(!self.votes.exists(address), "Cannot vote twice");

    self.votes.set(address, value);
    self.size += 1;
}