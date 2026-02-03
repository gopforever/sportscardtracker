import React from 'react';
import { formatCurrency } from '../utils/formatters.js';

const CardCard = ({ card, onSelect }) => {
  const {
    name,
    year,
    brand,
    sport,
    player_name,
    image_url,
    ebay_price,
    ebay_url,
    comc_price,
    comc_url
  } = card;

  const lowestPrice = Math.min(
    ebay_price || Infinity,
    comc_price || Infinity
  );

  const hasPrice = lowestPrice !== Infinity;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
      {/* Image */}
      <div className="aspect-[3/4] bg-gray-100 relative">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-4xl">
          🏀
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Player Name */}
        {player_name && (
          <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">
            {player_name}
          </p>
        )}

        {/* Card Name */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">
          {name}
        </h3>

        {/* Details */}
        <div className="space-y-1 mb-3">
          {year && (
            <p className="text-xs text-gray-600">
              <span className="font-medium">Year:</span> {year}
            </p>
          )}
          {brand && (
            <p className="text-xs text-gray-600">
              <span className="font-medium">Brand:</span> {brand}
            </p>
          )}
          {sport && (
            <p className="text-xs text-gray-600">
              <span className="font-medium">Sport:</span> {sport}
            </p>
          )}
        </div>

        {/* Prices */}
        {hasPrice ? (
          <div className="space-y-2 mb-3">
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(lowestPrice)}
              <span className="text-xs font-normal text-gray-500 ml-1">lowest</span>
            </div>
            <div className="flex gap-2 text-xs">
              {ebay_price && (
                <a
                  href={ebay_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  eBay: {formatCurrency(ebay_price)}
                </a>
              )}
              {comc_price && (
                <a
                  href={comc_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700"
                >
                  COMC: {formatCurrency(comc_price)}
                </a>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-3">Price not available</p>
        )}

        {/* Actions */}
        {onSelect && (
          <button
            onClick={() => onSelect(card)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Select Card
          </button>
        )}
      </div>
    </div>
  );
};

export default CardCard;
