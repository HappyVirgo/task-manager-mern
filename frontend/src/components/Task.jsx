import Tooltip from './utils/Tooltip';
import { Link } from 'react-router-dom';

const Task = ({task, handleDelete, index}) => {
    return (
        <div key={task._id || index} className='bg-white my-4 p-4 text-gray-600 rounded-md shadow-md'>
            <div className='flex'>

                <span className='font-medium'>{task.title}</span>

                <Tooltip text={"Edit this task"} position={"top"}>
                    <Link to={`/tasks/${task._id}`} className='ml-auto mr-2 text-green-600 cursor-pointer'>
                        <i className="fa-solid fa-pen"></i>
                    </Link>
                </Tooltip>

                <Tooltip text={"Delete this task"} position={"top"}>
                    <span className='text-red-500 cursor-pointer' onClick={() => handleDelete(task._id)}>
                        <i className="fa-solid fa-trash"></i>
                    </span>
                </Tooltip>

            </div>
            <div className='flex'>
                <div className='whitespace-pre'>{task.description}</div>
                <div className='mr-2 ml-auto flex items-center justify-center'>
                    <span className={`block w-3 h-3 mr-2 rounded-full ${task.completed ? "bg-green-600" : "bg-red-500"}`}></span>
                    <div className='whitespace-pre'>{task.completed ? "Completed": "Pending"}</div>
                </div>
            </div>
        </div>
    )
}

export default Task;