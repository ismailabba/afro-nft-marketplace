//SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

//interface calls externally accessible functions  of a contract
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

//reentrancy guard
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


contract Marketplace is ReentrancyGuard {

    address payable public immutable feeAccount; //account that receives payment
    uint public immutable feePercent; //fee percent on sales
    uint public itemCount;

    //track nfts listed
    struct Item{
        uint itemId;
        //instance of nft contrat
        IERC721 nft;
        uint tokenId;
        uint price;
        address payable seller;
        bool sold;

    }

    event Offered(
         uint itemId,
         address indexed nft,
         uint tokenId,
         uint price,
         address indexed seller
        

    );

    //store all the itrms
    mapping(uint => Item) public items;

    constructor(uint _feePercent){
        feeAccount = payable(msg.sender);
        feePercent = _feePercent;
    }

    //function to make item
    //from frontend solidity will take address of the nft and turn it into an nft contract instance
    //nonentrant prevents hackers from calling make item function and calling back into it before the first has finished
    function makeItem(IERC721 _nft, uint _tokenId, uint _price) external nonReentrant{
        require(_price > 0, "Price must be greater than zero" );

        //increment itemcount
        itemCount++;

        //transfer nft
        _nft.transferFrom(msg.sender, address(this), _tokenId);

        //add new item to items mapping
        items[itemCount] = Item(itemCount, _nft, _tokenId, _price, payable(msg.sender), false);

        //emit event
        emit Offered(itemCount, address(_nft), _tokenId, _price, msg.sender);
    }

    function purchaseItem(uint _itemId) external payable nonReentrant {
        
    }


    function getTotalPrice(uint _itemId) view public returns(uint) {
        
    }

}
 