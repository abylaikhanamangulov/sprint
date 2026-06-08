import React, { useState } from 'react';
import styled from 'styled-components';
import { MaskIcon } from '../Profile.styles';
import { BottomModal } from 'src/components/ui/BottomModal/BottomModal';

// Icons 
import addCircleIcon from 'src/components/icons/assets/add-circle.svg';
import verifiedCheckIcon from 'src/components/icons/assets/verefied-check.svg';

const Tabs = styled.div`
  display: flex;
  gap: 24px;
  border-bottom: 1px solid #2a2a2a;
  margin-bottom: 24px;
`;

const Tab = styled.div<{ $active: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${({ $active }) => ($active ? '#fff' : '#666')};
  padding-bottom: 8px;
  position: relative;
  cursor: pointer;
  transition: color 0.2s;

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ $active }) => ($active ? '#cfff04' : 'transparent')};
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
    transition: background 0.2s;
  }
`;

const ScrollableList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 40px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const TaskCard = styled.div`
  background: #1a1a1a;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const TaskTitleWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TaskTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #fff;
`;

const RewardWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
`;

const Divider = styled.div`
  height: 1px;
  background: #2a2a2a;
  margin: 0 0 20px 0;
`;

const SubTasksContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  margin-bottom: 24px;
`;

const SubTaskItemWrap = styled.div`
  display: flex;
  gap: 16px;
  position: relative;
`;

const SubTaskDotWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 14px;
`;

const SubTaskDot = styled.div<{ $completed: boolean }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: ${({ $completed }) => ($completed ? '#cfff04' : '#2a2a2a')};
  flex-shrink: 0;
  margin-top: 4px;
  z-index: 2;
`;

const SubTaskLineSegment = styled.div<{ $completed: boolean; $isLast: boolean }>`
  width: 2px;
  flex-grow: 1;
  background: ${({ $completed }) => ($completed ? '#cfff04' : '#2a2a2a')};
  margin-top: -2px;
  margin-bottom: -6px;
  min-height: 24px;
  display: ${({ $isLast }) => ($isLast ? 'none' : 'block')};
  z-index: 1;
`;

const SubTaskContent = styled.div<{ $isLast: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: ${({ $isLast }) => ($isLast ? '0' : '24px')};
  flex: 1;
`;

const SubTaskTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  line-height: 1.2;
  margin-top: 2px;
`;

const SubTaskDesc = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #888;
  line-height: 1.4;
  
  a {
    color: #cfff04;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ActionButton = styled.button<{ $completed: boolean }>`
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  border: none;
  font-size: 16px;
  font-weight: 700;
  background: ${({ $completed }) => ($completed ? '#cfff04' : '#2a2a2a')};
  color: ${({ $completed }) => ($completed ? '#000' : '#888')};
  cursor: pointer;
  transition: transform 0.1s, opacity 0.2s;
  
  &:active {
    transform: scale(0.98);
  }
  
  &:hover {
    opacity: 0.9;
  }
`;

interface TasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  inProcess: any[];
  completed: any[];
}

export const TasksModal: React.FC<TasksModalProps> = ({ isOpen, onClose, inProcess, completed }) => {
  const [activeTab, setActiveTab] = useState<'in_process' | 'completed'>('in_process');

  const currentList = activeTab === 'in_process' ? inProcess : completed;

  const getSubTasks = (ach: any) => {
    const isAchCompleted = ach.unlocked || activeTab === 'completed';
    
    // Разбиваем описание ачивки на подзадачи по предложениям
    let parts = ach.description 
      ? ach.description.split('. ').filter((p: string) => p.trim().length > 0) 
      : [];
    
    // Если описание состоит из одного предложения, но длинное, можно попробовать разбить по запятой
    if (parts.length === 1 && parts[0].length > 50 && parts[0].includes(', ')) {
      parts = parts[0].split(', ');
    }

    if (parts.length === 0) {
      parts = ['Выполнить условия задания'];
    }

    return parts.map((part: string, index: number) => {
      // Имитация прогресса для заданий "Не выполнено" (чтобы выглядело как на фото)
      // Если у нас 3+ заданий, первые 1-2 будут зелёными. Если 2 - первое зелёное и т.д.
      const mockCompletedSteps = Math.max(1, Math.floor(parts.length / 2));
      const isCompleted = isAchCompleted ? true : index < mockCompletedSteps && parts.length > 1;
      
      let descText = part.trim();
      // Добавляем точку в конец, если её нет (кроме тех случаев, когда разбили по запятой)
      if (!descText.endsWith('.') && parts.length > 1 && !ach.description.includes(', ')) {
        descText += '.';
      }

      return {
        id: index,
        title: parts.length > 1 ? `Задание ${index + 1}` : ach.name,
        desc: descText,
        completed: isCompleted,
      };
    });
  };

  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title="Задания">


        <Tabs>
          <Tab $active={activeTab === 'in_process'} onClick={() => setActiveTab('in_process')}>
            Не выполнено
          </Tab>
          <Tab $active={activeTab === 'completed'} onClick={() => setActiveTab('completed')}>
            Выполнено
          </Tab>
        </Tabs>

        <ScrollableList>
          {currentList.map((ach) => {
            const subTasks = getSubTasks(ach);
            const totalTasks = subTasks.length;
            const completedCount = subTasks.filter((t: any) => t.completed).length;
            const percentage = Math.round((completedCount / totalTasks) * 100);
            
            return (
              <TaskCard key={ach.id}>
                <CardHeader>
                  <TaskTitleWrap>
                    <MaskIcon $src={verifiedCheckIcon} $color="#cfff04" $size={24} />
                    <TaskTitle>{ach.name}</TaskTitle>
                  </TaskTitleWrap>
                  <RewardWrap>
                    <MaskIcon $src={addCircleIcon} $color="#cfff04" $size={20} />
                    {ach.rewardCoins.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </RewardWrap>
                </CardHeader>

                <Divider />

                <SubTasksContainer>
                  {subTasks.map((task: any, index: number) => {
                    const isLast = index === subTasks.length - 1;
                    const isLineCompleted = task.completed && (index + 1 < subTasks.length ? subTasks[index + 1].completed : false);

                    return (
                      <SubTaskItemWrap key={task.id}>
                        <SubTaskDotWrap>
                          <SubTaskDot $completed={task.completed} />
                          <SubTaskLineSegment $completed={isLineCompleted} $isLast={isLast} />
                        </SubTaskDotWrap>
                        
                        <SubTaskContent $isLast={isLast}>
                          <SubTaskTitle>{task.title}</SubTaskTitle>
                          <SubTaskDesc dangerouslySetInnerHTML={{ __html: task.desc }} />
                        </SubTaskContent>
                      </SubTaskItemWrap>
                    );
                  })}
                </SubTasksContainer>

                <ActionButton $completed={percentage === 100}>
                  {percentage === 100 ? 'Завершено 100%' : `Выполнено ${percentage}%`}
                </ActionButton>
              </TaskCard>
            );
          })}
          {currentList.length === 0 && (
            <div style={{ textAlign: 'center', color: '#666', marginTop: 40 }}>
              Нет заданий
            </div>
          )}
        </ScrollableList>
    </BottomModal>
  );
};


