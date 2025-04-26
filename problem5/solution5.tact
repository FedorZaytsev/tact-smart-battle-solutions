//
// Public solution template
//

message Vote {
    value: Bool;
}

struct ProposalState {
    yesCount: Int as uint32;
    noCount: Int as uint32;
}

struct Init {
    proposalId: Int as uint32;
    votingEndingAt: Int as uint32;
}

struct Storage {
    // possible replace with an array
    votes: map<Int as uint32, Bool>;

    // should be uint7
    yesCount: Int as uint32 = 0;
    noCount: Int as uint32 = 0;
}

extends mutates fun add(self: Storage, address: Address, value: Bool) {
    //dump("add");
    //dump(address);
    let addressShifted = address.asSlice().loadUint(256) >> (256-32);
    //dump(addressShifted);
    require(!self.votes.exists(addressShifted), "Cannot vote twice");

    self.votes.set(addressShifted, value);
    if (value) {
        self.yesCount += 1;
    } else {
        self.noCount += 1;
    }
}


contract Proposal {
    data: Init;
    storage: Storage;

    init(data: Init) {
        self.data = data;
        self.storage = Storage {
            votes: emptyMap(),
        };
    }

    // deploy
    receive() { }

    receive(msg: Vote) {
        require(context().value > getComputeFee(5600, true), "Not enough gas");
        
        // get current time
        let currentTime: Int = now();

        // validation
        require(currentTime <= self.data.votingEndingAt, "Voting has ended");

        self.storage.add(sender(), msg.value);

        // this was hard to find
        cashback(sender());
    }

    get fun proposalState(): ProposalState {
        return ProposalState {
            yesCount: self.storage.yesCount,
            noCount: self.storage.noCount,
        };
    }
}
