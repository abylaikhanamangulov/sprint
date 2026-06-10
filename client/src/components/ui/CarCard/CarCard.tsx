import styled from 'styled-components';
import { ChevronRight } from 'lucide-react';

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: #111111;
  border: 1px solid #27272a;
  border-radius: 16px;
  padding: 16px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: #18181b;
    border-color: #3f3f46;
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  aspect-ratio: 16 / 10;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    /* Optional shadow to make the car pop if it has a transparent background */
    filter: drop-shadow(0 15px 25px rgba(0,0,0,0.5));
    transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  }

  ${CardContainer}:hover & img {
    transform: scale(1.05);
  }
`;

const InfoContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const TextContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0; /* needed for truncation */
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: -0.02em;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Price = styled.p`
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
`;

const ActionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  margin-left: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  transition: background 0.4s cubic-bezier(0.25, 1, 0.5, 1), transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);

  ${CardContainer}:hover & {
    background: rgba(255, 255, 255, 0.2);
    transform: translateX(4px);
  }
`;

export interface CarCardProps {
  imageSrc: string;
  name: string;
  price: React.ReactNode;
  badge?: React.ReactNode;
  onClick?: () => void;
}

export function CarCard({ imageSrc, name, price, badge, onClick }: CarCardProps) {
  return (
    <CardContainer onClick={onClick}>
      {badge && (
        <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 2 }}>
          {badge}
        </div>
      )}
      <ImageContainer>
        <img src={imageSrc} alt={name} />
      </ImageContainer>
      <InfoContainer>
        <TextContent>
          <Title>{name}</Title>
          <Price as="div">{price}</Price>
        </TextContent>
        <ActionIcon>
          <ChevronRight size={18} strokeWidth={2.5} />
        </ActionIcon>
      </InfoContainer>
    </CardContainer>
  );
}
