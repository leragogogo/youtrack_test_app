import LoaderScreen from '@jetbrains/ring-ui-built/components/loader-screen/loader-screen'
import Heading from '@jetbrains/ring-ui-built/components/heading/heading';
import List from '@jetbrains/ring-ui-built/components/list/list';
import Toggle from '@jetbrains/ring-ui-built/components/toggle/toggle';
import Alert from '@jetbrains/ring-ui-built/components/alert/alert';
import { useProjects } from '../../providers/projects_provider';
import { useFlag } from '../../providers/flag_provider';
import './app.css';
import { useState, useEffect } from 'react';


const App = () => {
  const { projectsLoading, projectError, projects } = useProjects()
  const { flagLoading, flagError, flag, toggle } = useFlag()

  // State for showing flag alert
  const [flagAlertShow, setFlagAlertShow] = useState(false);
  const [flagAlertIsClosing, setFlagAlertIsClosing] = useState(false);

  // State for showing projects alert
  const [projectsAlertShow, setProjetsAlertShow] = useState(false);
  const [projectsIsClosing, setProjectsAlertIsClosing] = useState(false);

  // Open alert whenever a new flag conflict/error  message appears
  useEffect(() => {
    if (flagError) {
      setFlagAlertIsClosing(false);
      setFlagAlertShow(true);
    }
  }, [flagError]);

  // Open alert whenever a new projects error message appears
  useEffect(() => {
    if (projectError) {
      setProjectsAlertIsClosing(false);
      setProjetsAlertShow(true);
    }
  }, [projectError]);

  // Display loader while data for projects or flag is being fetched
  if (projectsLoading || flagLoading) {
    return <div className='widget'>
      <LoaderScreen />
    </div>
  }


  return (
    <div className='widget'>
      {/* Conflict flag alert */}
      {flagAlertShow && flagError && (
        <Alert
          type={Alert.Type.ERROR}
          onClose={() => setFlagAlertShow(false)}
          showWithAnimation={false}
          onCloseRequest={() => setFlagAlertIsClosing(true)}
          isClosing={flagAlertIsClosing}
        >
          {flagError}
        </Alert>
      )}
      {/* Projects error alert */}
      {projectsAlertShow && projectError && (
        <Alert
          type={Alert.Type.ERROR}
          onClose={() => setProjetsAlertShow(false)}
          showWithAnimation={false}
          onCloseRequest={() => setProjectsAlertIsClosing(true)}
          isClosing={projectsIsClosing}
        >
          {projectError}
        </Alert>
      )}

      {/* Global flag*/}
      <div>
        <Toggle
          size="M"
          checked={flag ?? false}
          onChange={(e) => toggle(e.target.checked)}>
          Global flag
        </Toggle>
      </div>
      {/* Projects list */}
      <div className='projects'>
        <Heading level={3}>Projects</Heading>
        {!projects || projects.length === 0 ?
          (
            <div className='no-projects'>
              No projects available to your account.
            </div>
          ) :
          (
            <List
              data={projects!.map(p => ({
                key: p.id,
                label: `${p.shortName || p.id} — ${p.name || ''}`
              }))} />
          )
        }
      </div>
    </div>
  );
}

export default App;